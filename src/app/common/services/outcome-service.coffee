angular.module("doubtfire.services.outcome-service", [])
.factory("outcomeService", (gradeService, projectService, taskService) ->
  
  outcomeService =
    unitTaskStatusFactor: () ->
      (task_definition_id) -> 1

    projectTaskStatusFactor: (project) ->
      (task_definition_id) ->
        taskService.learningWeight[projectService.taskFromTaskDefId(project, task_definition_id).status]

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
      _.each unit.ilos, (outcome) ->
        outcomes[outcome.id] = {
          0: []
          1: []
          2: []
          3: []
        }

      _.each source.task_outcome_alignments, (align) ->
        td = unit.taskDef(align.task_definition_id)
        outcomes[align.learning_outcome_id][td.target_grade].push align.rating * taskStatusFactor(td.id)

      _.each outcomes, (outcome, key) ->
        _.each outcome, (tmp, key1) ->
          scale = Math.pow(2, parseInt(key1,10))
          outcome[key1] = _.reduce(tmp, ((memo, num) -> memo + num), 0) * scale

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