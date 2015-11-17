angular.module("doubtfire.filters", [])

#
# Paging filter - start from the indicated index
#
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
        _.where  input, { tutorial: {tutor_name: tutorName} }
      else
        input
    else
      input
)

.filter('showTasks', ->
  (input, kind, tutorName) ->
    if input
      if kind == "myStudents"
        _.select  input, (t) -> t.project().tutorial.tutor_name == tutorName
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
      _.filter input, (task) -> task.definition.target_grade <= grade
    else
      input
)

.filter('studentsWithPlagiarism', ->
  (input) ->
    if input
      _.filter  input, (student) -> student.tasks_with_similarities > 0
    else
      input
)

.filter('taskWithPlagiarism', ->
  (input) ->
    if input
      _.filter input, (task) -> task.pct_similar > 0
    else
      input
)

.filter('studentsForGroup', ->
  (input, gs, grp, members) ->
    if input
      if gs.keep_groups_in_same_class
        _.filter input, (student) -> (student.tute == grp.tutorial_id) && (not _.find(members, (mbr) -> student.project_id == mbr.project_id ))
      else
        _.filter input, (student) -> not _.find(members, (mbr) -> student.project_id == mbr.project_id )
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
          _.filter input, (grp) -> grp.tutorial_id == project.tutorial.id
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

.filter('taskFilter', ->
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
