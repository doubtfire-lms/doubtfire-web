angular.module("doubtfire.common.services.projects", [])

#
# Service for handling projects
#
.factory("projectService", ($filter, taskService, Project, $rootScope, alertService, Task) ->
  projectService = {}

  projectService.loadedProjects = null

  projectService.taskStatIndex = {
    fail: 0,
    not_started: 1,
    do_not_resubmit: 2,
    redo: 3,
    need_help: 4,
    working_on_it: 5,
    fix_and_resubmit: 6,
    ready_to_mark: 7,
    discuss: 8,
    demonstrate: 9,
    complete: 10
  }

  $rootScope.$on 'signOut', ->
    projectService.loadedProjects = null

  projectService.getProjects = ( callback ) ->
    fireCallback = ->
      callback(projectService.loadedProjects) if _.isFunction(callback)
    unless projectService.loadedUnitRoles?
      success = (projects) ->
        projectService.loadedProjects = projects
        fireCallback()
      failure = (response) ->
        if response?.status != 419
          msg = unless response? then response.error else ''
          alertService.add("danger", "Failed to connect to Doubtfire server. #{msg}", 6000)
      Project.query(success, failure)
    else
      fireCallback()

  ###
  projects's can update their task stats
  converts the | delimited stats to its component arrays
  @param  student [Student|Project] The student's stats to update
  ###
  projectService.updateTaskStats = (project, new_stats_str) ->
    new_stats = project.task_stats
    for i, value of new_stats_str.split("|")
      if i < new_stats.length
        new_stats[i].value = Math.round(100 * value)
      else
        break

    project.task_stats = new_stats

  projectService.mapTask = ( task, unit, project ) ->
    td = unit.taskDef(task.task_definition_id)

    # Lookup and return the existing projTask task object
    projTask = project.findTaskForDefinition(td.id)
    if projTask?
      _.extend projTask, task
      if projTask.definition?
        return projTask
      else
        # Augment the existing project task
        task = projTask

    # Add in the related definition object
    task.definition = td

    # must be function to avoid cyclic structure
    task.project = -> project
    task.status_txt = -> taskService.statusLabels[task.status]
    task.statusSeq = -> taskService.statusSeq[task.status]
    task.updateTaskStatus = (project, new_stats) ->
      projectService.updateTaskStats(project, new_stats)
    task.needsSubmissionDetails = ->
      task.has_pdf == null || task.has_pdf == undefined
    task.statusClass = ->
      taskService.statusData(task.status).class
    task.statusIcon = ->
      taskService.statusData(task.status).icon
    task.statusLabel = ->
      taskService.statusData(task.status).label
    task.taskKey = ->
      taskService.taskKey(task)
    task.taskKeyToUrlString = ->
      taskService.taskKeyToUrlString(task)
    task.taskKeyToIdString = ->
      taskService.taskKeyToIdString(task)
    task.taskKeyFromString = (taskKeyString) ->
      taskService.taskKeyFromString(taskKeyString)
    task.hasTaskKey = (key) ->
      taskService.hasTaskKey(task, key)
    task.filterFutureStates = (states) ->
      _.reject states, (s) -> s.status in taskService.rejectFutureStates[task.status]
    task.getSubmissionDetails = ( success, failure ) ->
      unless task.needsSubmissionDetails()
        if _.isFunction(success) then success(task, {} )
      else
        Task.SubmissionDetails.get { id: project.project_id, task_definition_id: task.definition.id },
          (response) ->
            task.has_pdf = response.has_pdf
            task.processing_pdf = response.processing_pdf
            if _.isFunction(success) then success(task, response)
          (response) ->
            if _.isFunction(failure) then failure(task, response)
    task

  projectService.addTaskDetailsToProject = (project, unit) ->
    if (! project.tasks?) || project.tasks.length < unit.task_definitions.length
      base = unit.task_definitions.map (td) -> {
        id: null
        status: "not_started"
        task_definition_id: td.id
        include_in_portfolio: true
        pct_similar: 0
        similar_to_count: 0
        similar_to_dismissed_count: 0
        times_assessed: 0
        # pdf details are loaded from Task.SubmissionDetails
        # processing_pdf: null
        # has_pdf: null
      }

      base = _.filter base, (task) -> ! _.find(project.tasks, (pt) -> pt.task_definition_id == task.task_definition_id)

      project.tasks = [] unless project.tasks?
      Array.prototype.push.apply project.tasks, base

    project.tasks = project.tasks.map (task) ->
      projectService.mapTask task, unit, project
    project.tasks = _.sortBy(project.tasks, (t) -> t.definition.abbreviation).reverse()
    project

  projectService.addProjectMethods = (project, unit) ->
    project.updateBurndownChart = ->
      Project.get { id: project.project_id }, (response) ->
        project.burndown_chart_data = response.burndown_chart_data

    project.incorporateTask = (newTask) ->
      unless project.tasks?
        project.tasks = []

      currentTask = _.find project.tasks, (t) -> t.task_definition_id == newTask.task_definition_id

      if currentTask?
        currentTask = _.extend currentTask, newTask
      else
        project.tasks.push projectService.mapTask(newTask, unit, project)
        currentTask = newTask
      currentTask

    project.refresh = (unit_obj) ->
      Project.get { id: project.project_id }, (response) ->
        _.extend project, response
        if unit_obj
          projectService.addTaskDetailsToProject(project, unit_obj)

  projectService.fetchDetailsForProject = (project, unit, callback) ->
    if project.burndown_chart_data?
      callback(project)
    else
      Project.get { id: project.project_id }, (project_response) ->
        _.extend project, project_response

        projectService.addProjectMethods(project, unit)

        if unit
          projectService.addTaskDetailsToProject(project, unit)
        callback(project)

  projectService.updateGroups = (project) ->
    if project.groups?
      Project.get { id: project.project_id }, (response) ->
        project.groups = response.groups

  projectService.getGroupForTask = (project, task) ->
    return null if not task.definition.group_set

    _.find project.groups, (grp) -> grp.group_set_id == task.definition.group_set.id

  projectService.taskFromTaskDefId = (project, task_definition_id) ->
    project.findTaskForDefinition(task_definition_id)

  projectService.tasksInTargetGrade = (project) ->
    $filter('byGrade')(project.tasks, project.target_grade)

  projectService.tasksByStatus = (project, statusKey) ->
    tasksToConsider = projectService.tasksInTargetGrade(project)
    _.filter(tasksToConsider, {status: statusKey})

  projectService
)
