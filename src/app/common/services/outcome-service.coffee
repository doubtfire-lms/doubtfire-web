angular.module("doubtfire.services.outcome-service", [])
.factory("outcomeService", (gradeService) ->
  
  outcomeService =
    calculateTargets: (unit, source) ->
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
        outcomes[align.learning_outcome_id][td.target_grade].push align.rating * source.taskStatusFactor(td.id)

      _.each outcomes, (outcome, key) ->
        _.each outcome, (tmp, key1) ->
          scale = Math.pow(2, parseInt(key1,10))
          outcome[key1] = _.reduce(tmp, ((memo, num) -> memo + num), 0) * scale

      outcomes

    calculateProgress: (unit, project) ->
      outcomes = outcomeService.calculateTargets(unit, project)

      _.each outcomes, (outcome, key) ->
        outcomes[key] = _.reduce(outcome, ((memo, num) -> memo + num), 0)

      outcomes


    targetsByGrade: (unit, source) ->
      result = []
      outcomes = outcomeService.calculateTargets(unit, source)

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