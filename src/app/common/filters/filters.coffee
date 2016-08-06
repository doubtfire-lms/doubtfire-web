_ = require('lodash')

#
# Paging filter - start from the indicated index
#
mod = angular.module("doubtfire.common.filters", [])

.filter('startFrom', ->
  (input, start) ->
    start = +start # parse to int
    if input
      input.slice(start)
    else
      input
)

.filter('showStudents', ->
  (input, kind, tutorName) ->
    if input
      if kind == "myStudents"
        _.filter  input, { tutorial: {tutor_name: tutorName} }
      else
        input
    else
      input
)

.filter('showTasks', ->
  (input, kind, tutorName) ->
    if input
      if kind == "myStudents"
        _.filter  input, (t) -> (t?) && t.project().tutorName() == tutorName
      else
        input
    else
      input
)

.filter('orderObjectBy', ->
  (items, field, reverse) ->
    filtered = []

    angular.forEach items, (item) ->
      filtered.push(item)

    filtered.sort (a, b) ->
      a[field] > b[field] ? 1 : -1

    if reverse
      filtered.reverse()

    filtered
)

.filter('byGrade', ->
  (input, grade) ->
    if input
      _.filter input, (task) -> (task?) && task.definition.target_grade <= grade
    else
      input
)

.filter('studentsWithPlagiarism', ->
  (input) ->
    if input
      _.filter  input, (student) -> (student?) && student.max_pct_copy > 0
    else
      input
)

.filter('studentsWithPortfolio', ->
  (input) ->
    if input
      _.filter  input, (student) -> (student?) && student.has_portfolio > 0
    else
      input
)

.filter('studentsWithTargetGrade', ->
  (input, grade) ->
    if input
      _.filter  input, (student) -> (student?) && student.target_grade == grade
    else
      input
)

.filter('taskWithPlagiarism', ->
  (input) ->
    if input
      _.filter input, (task) -> (task?) && task.pct_similar > 0
    else
      input
)

.filter('studentsForGroup', ->
  (input, gs, grp, members) ->
    if input
      if gs.keep_groups_in_same_class
        _.filter input, (student) -> (student?) && (student.tutorial_id == grp.tutorial_id) && (not _.find(members, (mbr) -> student.project_id == mbr.project_id ))
      else
        _.filter input, (student) -> (student?) && not _.find(members, (mbr) -> student.project_id == mbr.project_id )
    else
      input
)

#
# Filter groups for students and in group admin pages
#   gs: group set to determine if keep to class
#   project: nil for admin pages, otherwise student
#   assessingUnitRole: nil for student, otherwise staff details
#   kind: 'all' | 'mine'
#
.filter('groupFilter', ->
  (input, unit, gs, project, assessingUnitRole, kind) ->
    if input
      if assessingUnitRole && ! project # staff only... so tutorial is ignored!
        if kind == 'mine'
          _.filter input, (grp) -> unit.tutorialFromId(grp.tutorial_id).tutor_name == assessingUnitRole.name
        else # just all
          input
      else  # student...
        if gs.keep_groups_in_same_class # match just those in this tutorial
          _.filter input, (grp) -> (project.tutorial?) && grp.tutorial_id == project.tutorial.id
        else # all
          input
    else
      input
)

.filter('outcomeFilter', ->
  (input, outcomeId) ->
    if input && outcomeId
      _.filter input, (item) -> item.learning_outcome_id == outcomeId
    else
      input
)

.filter('taskDefinitionFilter', ->
  (input, taskDefId) ->
    if input && taskDefId
      _.filter input, (item) -> item.task_definition_id == taskDefId
    else
      input
)

.filter('truncatedMarkdown', ($filter) ->
  (input, truncateTo) ->
    truncateTo = truncateTo or 128
    input = $filter('markdown')(input)
    input = $filter('stripTags')(input)
    $filter('truncate')(input, truncateTo, '...')
)

.filter('statusFilter', ->
  (input, statusKind) ->
    if input && statusKind
      _.filter input, (task) ->
        if statusKind == 'discuss'
          task.status == statusKind || task.status == 'demonstrate'
        else
          task.status == statusKind
    else
      input
)

.filter('taskFilter', ->
  (input, text) ->
    if _.isString text
      matchText = text.toLowerCase()
      if input
        _.filter  input, (task) ->
          if task?
            project = task.project()
            (task.definition.abbreviation.toLowerCase().indexOf(matchText) >= 0) ||
              (task.definition.name.toLowerCase().indexOf(matchText) >= 0) ||
              (project? && ( project.student_id.indexOf(matchText) >= 0 || project.name.toLowerCase().indexOf(matchText) >= 0 || (project.tutorial? && (project.tutorial.abbreviation.toLowerCase().indexOf(matchText) >= 0 || project.tutorName().toLowerCase().indexOf(matchText) >= 0))))
          else
            false
      else
        input
)

.filter('projectFilter', ->
  (input, text) ->
    if _.isString text
      matchText = text.toLowerCase()
      if input
        _.filter  input, (project) -> (project?) && ( project.student_id.indexOf(matchText) >= 0 || project.name.toLowerCase().indexOf(matchText) >= 0 || (project.tutorial? && (project.tutorial.abbreviation.toLowerCase().indexOf(matchText) >= 0 || project.tutorName().toLowerCase().indexOf(matchText) >= 0)) )
      else
        input
)

.filter('taskForPortfolio', (taskService) ->
  (input, apply) ->
    if (! apply) || (! input)
      input
    else
      _.filter input, (task) ->
        if task?
          !_.includes(taskService.toBeWorkedOn, task.status)
        else
          false
)

module.exports = mod.name
