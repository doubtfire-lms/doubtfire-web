angular.module("doubtfire.common.filters", [])

#
# Paging filter - start from the indicated index
#
.filter('startFrom', ->
  (input, start) ->
    input?.slice(+start)
)

.filter('showStudents', ->
  (input, kind, tutorName) ->
    if input
      if kind == "mine"
        _.filter  input, { tutorial: {tutor_name: tutorName} }
      else
        input
    else
      input
)

.filter('showTasks', ->
  (input, kind, tutorName) ->
    if input
      if kind == "mine"
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
  (input, option) ->
    if input
      _.filter  input, (student) ->  option == 'allStudents' || ((student?) && student.has_portfolio > 0)
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
  (input, gs, group, members) ->
    if input
      if gs.keep_groups_in_same_class
        _.filter input, (student) -> (student?) && (student.tutorial_id == group.tutorial_id) && (not _.find(members, (mbr) -> student.project_id == mbr.project_id ))
      else
        _.filter input, (student) -> (student?) && not _.find(members, (mbr) -> student.project_id == mbr.project_id )
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
              (project? && ( project.student_id.indexOf(matchText) >= 0 || project.name.toLowerCase().indexOf(matchText) >= 0 || (project.tutorial? && (project.tutorial.abbreviation.toLowerCase().indexOf(matchText) >= 0 || (project.tutorName()? && project.tutorName().toLowerCase().indexOf(matchText) >= 0)))))
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
        _.filter  input, (project) -> (project?) && ( project.student_id.indexOf(matchText) >= 0 || project.name.toLowerCase().indexOf(matchText) >= 0 || (project.tutorial? && (project.tutorial.abbreviation.toLowerCase().indexOf(matchText) >= 0 || (project.tutorName()? && project.tutorName().toLowerCase().indexOf(matchText) >= 0))) )
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

# NEW FILTERS

.filter('tasksOfTaskDefinition', ->
  (tasks, taskDefinition) ->
    return tasks unless (taskDefinition? && tasks?)
    tasks = _.filter tasks, { task_definition_id: taskDefinition.id }
)

.filter('tasksWithStatuses', ->
  (tasks, statusKeys) ->
    return tasks unless tasks?
    return [] if _.isEmpty statusKeys
    _.filter tasks, (task) -> _.includes(statusKeys, task.status)
)

.filter('tasksInTutorials', ->
  (tasks, tutorialIds) ->
    return tasks unless tasks?
    return [] if _.isEmpty tutorialIds
    _.filter tasks, (task) -> _.includes(tutorialIds, task.project().tutorial_id)
)

.filter('tasksWithStudentName', ->
  (tasks, searchName) ->
    return tasks unless (searchName? && tasks?)
    searchName = searchName.toLowerCase()
    _.filter tasks, (task) ->
      task.project().name.toLowerCase().indexOf(searchName) >= 0
)

.filter('groupsInTutorials', ->
  (input, unitRole, kind) ->
    return unless input? && unitRole? && kind?
    return input if kind == 'all'
    if kind == 'mine'
      _.filter(input, (group) -> group.tutorial().tutor_name == unitRole.name)
)

.filter('groupsForStudent', ->
  (input, project, groupSet) ->
    # Filter by tutorial if keep groups in same class
    return unless input? && groupSet? && project?
    return input unless groupSet.keep_groups_in_same_class
    if groupSet.keep_groups_in_same_class
      _.filter(input, (group) -> group.tutorial_id == project.tutorial?.id)
)

.filter('paginateAndSort', ($filter) ->
  (input, pagination, tableSort) ->
    return unless input? && tableSort? && pagination?
    return input if input.length == 0
    pagination.show = input.length > pagination.pageSize
    pagination.totalSize = input.length
    input = $filter('orderBy')(input, tableSort.order, tableSort.reverse)
    input = $filter('startFrom')(input, (pagination.currentPage - 1) * pagination.pageSize)
    input = $filter('limitTo')(input, pagination.pageSize)
    input
)

.filter('tasksWithName', ->
  (tasks, searchName) ->
    return tasks unless (searchName? && tasks?)
    searchName = searchName.toLowerCase()
    _.filter(tasks, (task) ->
      # Search using name or abbreviation
      task.definition.name.toLowerCase().indexOf(searchName) >= 0 ||
      task.definition.abbreviation.toLowerCase().indexOf(searchName) >= 0
    )
)

.filter('humanizedDate', ($filter) ->
  (input) ->
    return unless input?
    moment(input).calendar(null, {
      sameDay: '',
      nextDay: '[tomorrow]',
      nextWeek: '[this] dddd',
      lastDay: '[yesterday]',
      lastWeek: '[last] dddd',
      sameElse: 'DD/MM/YYYY'
    })
)

.filter('lcfirst', ->
  (input) ->
    return if !input? || input.length == 0
    input[0].toLowerCase() + input.substring(1)
)

.filter('isActiveUnitRole', ->
  (unitRoles) ->
    _.filter(unitRoles, (ur) -> ur.active )
)