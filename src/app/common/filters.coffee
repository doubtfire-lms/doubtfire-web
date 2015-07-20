angular.module("doubtfire.filters", [  ])

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