angular.module("doubtfire.common.filters", [])

#
# Paging filter - start from the indicated index
#
.filter('startFrom', ->
  (input, start) ->
    input?.slice(+start)
)

.filter('showStudents', ->
  (input, kind, tutor) ->
    if input
      if kind == "mine" || kind == "myStudents"
        _.filter  input, (project) -> project.hasTutor(tutor)
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
      _.filter input, (task) -> (task?) && task.definition.targetGrade <= grade
    else
      input
)

.filter('studentsWithPlagiarism', ->
  (input) ->
    if input
      _.filter  input, (student) -> (student?) && student.maxPctCopy > 0
    else
      input
)

.filter('studentsWithPortfolio', ->
  (input, option) ->
    if input
      _.filter  input, (student) ->  option == 'allStudents' || ((student?) && student.hasPortfolio > 0)
    else
      input
)

.filter('studentsWithSubmittedGrade', ->
  (input, grade) ->
    if input && grade > -1
      _.filter  input, (student) -> (student?) && student.submittedGrade == grade
    else
      input
)

.filter('taskWithPlagiarism', ->
  (input) ->
    if input
      _.filter input, (task) -> (task?) && task.pctSimilar > 0
    else
      input
)

.filter('studentsForGroup', ->
  (input, gs, group, members) ->
    if input
      if gs.keepGroupsInSameClass
        _.filter input, (student) -> (student?) && (student.isEnrolledIn(group.tutorial)) && (not _.find(members, (mbr) -> student.id == mbr.id ))
      else
        _.filter input, (student) -> (student?) && not _.find(members, (mbr) -> student.id == mbr.id )
    else
      input
)

.filter('outcomeFilter', ->
  (input, outcomeId) ->
    if input && outcomeId
      _.filter input, (item) -> item.learningOutcome?.id == outcomeId
    else
      input
)

.filter('taskDefinitionFilter', ->
  (input, taskDefId) ->
    if input && taskDefId
      _.filter input, (item) -> item.definition.id == taskDefId
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

.filter('projectFilter', ->
  (input, text) ->
    if _.isString(text) && text.length > 0 && input
      matchText = text.toLowerCase()
      _.filter  input, (project) -> (project?) && project.matches(matchText)
    else
      input
)

.filter('projectUnitFilter', ->
  (input, text) ->
    if _.isString(text) && text.length > 0 && input
      matchText = text.toLowerCase()
      _.filter  input, (project) -> (project?) && project.unit.matches(matchText)
    else
      input
)


.filter('taskForPortfolio', (newTaskService) ->
  (input, apply) ->
    if (! apply) || (! input)
      input
    else
      _.filter input, (task) ->
        if task?
          !_.includes(newTaskService.toBeWorkedOn, task.status)
        else
          false
)

# NEW FILTERS

.filter('tasksOfTaskDefinition', ->
  (tasks, taskDefinition) ->
    return tasks unless (taskDefinition? && tasks?)
    tasks = _.filter tasks, (task) -> task.definition.id == taskDefinition.id
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
    # If task is group task, then use group tutorial, else use project tutorial
    _.filter tasks, (task) ->
      if task.isGroupTask()
        if task.group()?
          _.includes(tutorialIds, task.group.tutorial.id)
      else
        _.filter(task.project.tutorials, (tutorial) ->
          _.includes(tutorialIds, tutorial.id)
        ).length > 0

)

.filter('tasksWithSearchText', ->
  (tasks, searchText) ->
    return tasks unless (searchText? && tasks?)
    searchText = searchText.toLowerCase()
    _.filter tasks, (task) ->
      p = task.project
      p.matches(searchText)
)

.filter('tutorialCampusFilter', ->
  (tutorials, project) ->
    return tutorials unless project?
    _.filter tutorials, (tute) ->
      !project.campus?.id? || !tute.campus? || tute.campus.id == project.campus.id
)

.filter('groupsInTutorials', ->
  (input, unitRole, kind) ->
    return unless input? && unitRole? && kind?
    if kind == 'mine'
      return _.filter(input, (group) -> group.tutorial.tutor.id == unitRole.user.id)
    return input
)

.filter('groupsForStudent', ->
  (input, project, groupSet) ->
    # Filter by tutorial if keep groups in same class
    return input unless input? && groupSet? && project?
    grp = project.groupForGroupSet(groupSet)
    return [grp] if grp
    return input unless groupSet.keepGroupsInSameClass
    _.filter(input, (group) -> project.isEnrolledIn(group.tutorial))
)

.filter('groupsWithName', ->
  (input, searchName) ->
    return input unless (searchName? && input?)
    searchName = searchName.toLowerCase()
    _.filter(input, (group) ->
      # Search using name or abbreviation
      group.name.toLowerCase().indexOf(searchName) >= 0
    )
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

.filter('taskDefinitionName', ->
  (taskDefinitions, searchName) ->
    return taskDefinitions unless (searchName? && taskDefinitions?)
    searchName = searchName.toLowerCase()
    _.filter(taskDefinitions, (td) ->
      # Search using name or abbreviation
      td.name.toLowerCase().indexOf(searchName) >= 0 ||
      td.abbreviation.toLowerCase().indexOf(searchName) >= 0 ||
      td.targetGradeText.toLowerCase().indexOf(searchName) >= 0
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

.filter('to_trusted', ($sce) ->
  (text) ->
    $sce.getTrustedHtml(text)
)
