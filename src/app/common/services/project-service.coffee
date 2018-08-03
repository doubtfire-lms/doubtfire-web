angular.module("doubtfire.common.services.projects", [])

#
# Service for handling projects
#
.factory("projectService", ($filter, taskService, Project, $rootScope, alertService, Task, Visualisation, gradeService) ->
  projectService = {}

  projectService.loadedProjects = null

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

  projectService.updateProject = (id, data, onSuccess, onFailure) ->
    data = _.extend({ id: id }, data)
    Project.update(data,
      (success) ->
        onSuccess?(success)
      (failure) ->
        onFailure?(failure)
    )

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
    task.unit = project.unit
    task.status_txt = -> taskService.statusLabels[task.status]
    task.statusSeq = -> taskService.statusSeq[task.status]
    task.canReuploadEvidence = ->
      taskService.canReuploadEvidence(task)
    task.requiresFileUpload = ->
      task.definition.upload_requirements.length > 0
    task.plagiarismDetected = ->
      taskService.plagiarismDetected(task)
    task.isGroupTask = ->
      taskService.isGroupTask(task)
    task.studentInAGroup = ->
      task.group()?
    task.group = ->
      projectService.getGroupForTask(task.project(), task)
    task.addComment = (textString, success, failure) ->
      taskService.addComment(task, textString, success, failure)
    task.applyForExtension = (onSuccess, onError) ->
      taskService.applyForExtension(task, onSuccess, onError)
    task.staffAlignments = ->
      taskService.staffAlignmentsForTask(task)
    task.timeToDue = ->
      if task.daysUntilTargetDate() < 0
        return ""
      else
        days = task.daysUntilTargetDate()
        if days < 7
          return "#{days}d"
        else
          return "#{Math.floor(days/7)}w"
    task.targetDate = ->
      if task.due_date?
        return task.due_date
      else
        return task.definition.target_date
    task.days_after_submission = moment().diff(task.submission_date,"days")
    task.daysAfterSubmission = ->
      daysAfter = task.days_after_submission
      if daysAfter < 0
        return ""
      else
        if daysAfter < 7
          return "#{daysAfter}d"
        else
          return "#{Math.floor(daysAfter/7)}w"
    task.isToBeCompletedSoon = ->
      task.daysUntilTargetDate() <= 7 && task.daysUntilTargetDate() >= 0 && ! task.inFinalState()
    task.isDueSoon = ->
      task.daysUntilDueDate() <= 7 && task.daysUntilDueDate() >= 0 && ! task.inFinalState()
    task.isOverdue = ->
      task.daysPastDueDate() > 0 && ! task.inFinalState()
    task.isPastTargetDate = ->
      task.daysPastTargetDate() > 0 && ! task.inFinalState()
    task.isDueToday = ->
      task.daysUntilDueDate() == 0 && ! task.inFinalState()
    task.daysPastDueDate = ->
      taskService.daysPastDueDate(task)
    task.daysPastTargetDate = ->
      taskService.daysPastTargetDate(task)
    task.daysUntilDueDate = ->
      taskService.daysUntilDueDate(task)
    task.daysUntilTargetDate = ->
      taskService.daysUntilTargetDate(task)

    task.inFinalState = ->
      task.status in taskService.finalStatuses
    task.inTerminalState = ->
      task.status in taskService.terminalStatuses

    task.triggerTransition = (status, unitRole) ->
      taskService.triggerTransition(task, status, unitRole)
    task.updateTaskStatus = (status, new_stats) ->
      task.status = status
      task.project().updateTaskStats(new_stats)
    task.needsSubmissionDetails = ->
      task.has_pdf == null || task.has_pdf == undefined
    task.statusClass = ->
      taskService.statusData(task.status).class
    task.statusIcon = ->
      taskService.statusData(task.status).icon
    task.statusLabel = ->
      taskService.statusData(task.status).label
    task.statusHelp = ->
      taskService.statusData(task.status).help
    task.taskKey = ->
      taskService.taskKey(task)
    task.recreateSubmissionPdf = (onSuccess, onFailure) ->
      taskService.recreateSubmissionPdf(task, onSuccess, onFailure)
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
    task.gradeDesc = () ->
      gradeService.gradeAcronyms[task.grade]
    task.hasGrade = () ->
      task.grade?
    task.getSubmissionDetails = (onSuccess, onFailure) ->
      return onSuccess?(task) unless task.needsSubmissionDetails()
      Task.SubmissionDetails.get({ id: project.project_id, task_definition_id: task.definition.id },
        (response) ->
          task.has_pdf = response.has_pdf
          task.processing_pdf = response.processing_pdf
          task.submission_date = response.submission_date
          onSuccess?(task)
        (response) ->
          onFailure?(response)
      )
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
        num_new_comments: 0
        # pdf details are loaded from Task.SubmissionDetails
        # processing_pdf: null
        # has_pdf: null
      }

      base = _.filter base, (task) -> ! _.find(project.tasks, {task_definition_id: task.task_definition_id})

      project.tasks = [] unless project.tasks?
      Array.prototype.push.apply project.tasks, base

    project.tasks = project.tasks.map (task) ->
      projectService.mapTask task, unit, project
    project.tasks = _.sortBy(project.tasks, (t) -> t.definition.abbreviation).reverse()
    project.target_tasks = () ->
      projectService.tasksInTargetGrade(project)
    project

  projectService.addProjectMethods = (project) ->
    return project if project.updateTaskStats?
    #
    # Update the project's task stats from a new stats string
    #
    project.updateTaskStats = (new_stats) ->
      updated_stats = project.task_stats

      updated_stats[0].value = Math.round(100 * new_stats.red_pct)
      updated_stats[1].value = Math.round(100 * new_stats.grey_pct)
      updated_stats[2].value = Math.round(100 * new_stats.orange_pct)
      updated_stats[3].value = Math.round(100 * new_stats.blue_pct)
      updated_stats[4].value = Math.round(100 * new_stats.green_pct)
      
      # Map the order directly to the project
      project.orderScale = Math.round(100 * new_stats.order_scale)

      project.task_stats = updated_stats

    project.updateBurndownChart = ->
      Project.get { id: project.project_id }, (response) ->
        project.burndown_chart_data = response.burndown_chart_data
        Visualisation.refreshAll()

    project.incorporateTask = (newTask, callback) ->
      unless project.tasks?
        project.tasks = []
      currentTask = _.find(project.tasks, {task_definition_id: newTask.task_definition_id})
      if currentTask?
        currentTask = _.extend(currentTask, newTask)
      else
        project.tasks.push(projectService.mapTask(newTask, unit, project))
        currentTask = newTask
      if currentTask.isGroupTask() and !currentTask.group()?
        projectService.updateGroups(currentTask.project(), callback, true)
      callback?()
      currentTask

    project.refresh = (unit_obj) ->
      Project.get { id: project.project_id }, (response) ->
        _.extend project, response
        if unit_obj
          projectService.addTaskDetailsToProject(project, unit_obj)

    project

  projectService.getProject = (project, unit, onSuccess, onFailure) ->
    projectId = if _.isNumber(project) then project else project?.project_id
    throw Error "No project id given to getProject" unless projectId?
    if project.burndown_chart_data?
      onSuccess?(project)
    else
      Project.get({ id: projectId },
        (response) ->
          project = _.extend(project, response)
          projectService.addProjectMethods(project)
          projectService.addTaskDetailsToProject(project, unit) if unit?
          onSuccess?(project)
        (failure) ->
          alertService.add("danger", "#{failure.data.error || "Unable to load project"}", 6000)
          onFailure?(failure)
      )

  projectService.updateGroups = (project, onSuccess, force = false) ->
    # Only update if the project has groups, or we are forced to update
    if project.groups? or force
      Project.get { id: project.project_id }, (response) ->
        project.groups = response.groups
        onSuccess?(project)
      project.unit().refreshGroups()

  projectService.getGroupForTask = (project, task) ->
    return null unless task.definition.group_set
    result = _.find project.groups, (group) -> group.group_set_id == task.definition.group_set.id
    result || _.find project.unit().groups, (group) -> group.group_set_id == task.definition.group_set.id && project.project_id in group.projects

  projectService.taskFromTaskDefId = (project, task_definition_id) ->
    project.findTaskForDefinition(task_definition_id)

  projectService.tasksInTargetGrade = (project) ->
    $filter('byGrade')(project.tasks, project.target_grade)

  projectService.tasksByStatus = (project, statusKey) ->
    tasksToConsider = projectService.tasksInTargetGrade(project)
    _.filter(tasksToConsider, {status: statusKey})

  projectService
)
