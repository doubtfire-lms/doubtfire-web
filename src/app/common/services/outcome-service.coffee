angular.module("doubtfire.services.outcome-service", [])
.factory("outcomeService", (gradeService, projectService, taskService) ->
  
  outcomeService =
    unitTaskStatusFactor: () ->
      (task_definition_id) -> 1

    projectTaskStatusFactor: (project) ->
      (task_definition_id) ->
        task = projectService.taskFromTaskDefId(project, task_definition_id)
        if task?
          taskService.learningWeight[task.status]
        else
          0

    individualTaskStatusFactor: (project, task) ->
      (task_definition_id) ->
        if task.definition.id == task_definition_id
          taskService.learningWeight[projectService.taskFromTaskDefId(project, task_definition_id).status]
        else
          0

    individualTaskPotentialFactor: (project, task) ->
      (task_definition_id) ->
        if task.definition.id == task_definition_id then 1 else 0

    calculateTargets: (unit, source, taskStatusFactor) ->
      outcomes = {}
      # For each learning outcome (LO) -- produce a map with grades containing task scores
      # calculated from alignment details, task target grade, and task status factor.
      #
      # The Task Status Factor for projects will be a value between 0 and 1
      # In the unit the taskStatusFactor will always be 1 (100%) to show potential values
      # for the unit -- in effect removing the task status from unit calculations
      _.each unit.ilos, (outcome) ->
        # Add grade map for this LO to outcomes map
        outcomes[outcome.id] = {
          # Using 0..3 so that it can be used to calculate the grade scale below
          0: [] # Pass grade... -- will contain scores for pass grade tasks
          1: [] # Credit grade... -- etc.
          2: []
          3: []
        }

      # For each outcome / task alignment...
      _.each source.task_outcome_alignments, (align) ->
        # Get the task definition
        td = unit.taskDef(align.task_definition_id)
        # Store a partial score for this task in the relevant outcomes ( outcomes[outcome id][grade] << score )
        # At this stage it is just rating * taskFactor (1 to 5 times 0 to 1)
        outcomes[align.learning_outcome_id][td.target_grade].push align.rating * taskStatusFactor(td.id)

      # Finally reduce all of these into one score for each outcome / grade
      _.each outcomes, (outcome, key) ->
        # For this outcome
        _.each outcome, (tmp, key1) ->
          # get a scale for the grade
          scale = Math.pow(2, parseInt(key1,10))
          # Reduce all task partial scores and * grade scale -- replace array with single value
          outcome[key1] = _.reduce(tmp, ((memo, num) -> memo + num), 0) * scale

      # Returns map of...
      # {
      #   <OutcomeID>: {
      #     0: <score>
      #     1: <score> ...
      #   },
      #   86: {   <--- OutcomeID 86 --> "Programming Principles"
      #     0: 27 <--- Pass: 27 score (from rating * task status factor * scale reduced)
      #     1: 53 ...
      #   },
      # }
      outcomes

    calculateTaskContribution: (unit, project, task) ->
      outcome_set = []
      outcome_set[0] = outcomeService.calculateTargets(unit, unit, outcomeService.individualTaskStatusFactor(project, task))

      _.each outcome_set[0], (outcome, key) ->
        outcome_set[0][key] = _.reduce(outcome, ((memo, num) -> memo + num), 0)

      outcome_set[0].title = 'Current Task Contribution'
      outcome_set

    calculateTaskPotentialContribution: (unit, project, task) ->
      outcomes = outcomeService.calculateTargets(unit, unit, outcomeService.individualTaskPotentialFactor(project, task))

      _.each outcomes, (outcome, key) ->
        outcomes[key] = _.reduce(outcome, ((memo, num) -> memo + num), 0)

      outcomes['title'] = 'Potential Task Contribution'
      outcomes

    calculateProgress: (unit, project) ->
      outcome_set = []

      outcome_set[0] = outcomeService.calculateTargets(unit, unit, outcomeService.projectTaskStatusFactor(project))
      # outcome_set[1] = outcomeService.calculateTargets(unit, project, outcomeService.projectTaskStatusFactor(project))

      _.each outcome_set, (outcomes, key) ->
        _.each outcomes, (outcome, key) ->
          outcomes[key] = _.reduce(outcome, ((memo, num) -> memo + num), 0)

      outcome_set[0].title = "Your Progress" # - Staff Suggestion"
      # outcome_set[1].title = "Your Progress - Your Reflection"

      outcome_set


    targetsByGrade: (unit, source) ->
      result = []
      outcomes = outcomeService.calculateTargets(unit, source, outcomeService.unitTaskStatusFactor())

      values = {
        '0': []
        '1': []
        '2': []
        '3': []
      }

      _.each outcomes, (outcome, key) ->
        _.each outcome, (tmp, key1) ->
          values[key1].push { label: unit.outcome(parseInt(key,10)).abbreviation, value:  tmp }

      _.each values, (vals, idx) ->
        result.push { key: gradeService.grades[idx], values: vals }

      result
)