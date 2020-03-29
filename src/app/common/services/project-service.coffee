angular.module("doubtfire.common.services.projects", [])

#
# Service for handling projects
#
.factory("projectService", ($filter, taskService, Project, $rootScope, alertService, Task, Visualisation, gradeService, TeachingPeriod) ->
  projectService = {}

  injectFunctionalityInProject = (project) ->
    unless project.teachingPeriod?
      # Store the linked teaching period in each project
      project._teachingPeriod = null
      project.teachingPeriod = () ->
        # If there is a teaching period and it is not linked... link on first access
        if project.teaching_period_id? && !project._teachingPeriod?
          project._teachingPeriod = TeachingPeriod.getTeachingPeriod(project.teaching_period_id)
        # Return the first role
        project._teachingPeriod
    project

  # This function is used by the task until/to descriptions
  timeToDescription = (earlyTime, laterTime) ->
    times = [
      "weeks"
      "days"
      "hours"
      "minutes"
      "seconds"
    ]

    for t in times
      #exactDiff is floating point
      exactDiff = laterTime.diff(earlyTime, t, true).toFixed(2)
      diff = Math.floor(exactDiff)
      # if days are more than 14 then show in week
      if(exactDiff > 2 && t == "weeks")
        return "#{diff} #{t.charAt(0).toUpperCase() + t.substr(1)}"
      # Always show in days, Hours, Minutes and Seconds.
      else if diff > 1 && t != "weeks"
        return "#{diff} #{t.charAt(0).toUpperCase() + t.substr(1)}"
      else if diff == 1 && t != "weeks"
        return "1 #{t.charAt(0).toUpperCase() + t.substr(1, t.length - 2)}"
    return laterTime.diff(earlyTime, "seconds")

  projectService.loadedProjects = null

  $rootScope.$on 'signOut', ->
    projectService.loadedProjects = null

  projectService.getProjects = ( inactive, callback ) ->
    fireCallback = ->
      if inactive
        projs = projectService.loadedProjects
      else
        projs = _.filter projectService.loadedProjects, (p) -> p.active
      callback(projs) if _.isFunction(callback)
    unless projectService.loadedProjects?
      success = (projects) ->
        projectService.loadedProjects = _.map projects, (p) -> injectFunctionalityInProject(p)
        fireCallback()
      failure = (response) ->
        if response?.status != 419
          msg = unless response? then response.error else ''
          alertService.add("danger", "Failed to connect to Doubtfire server. #{msg}", 6000)
      Project.query({include_inactive: true}, success, failure)
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
    task.unit = -> unit
    task.status_txt = -> taskService.statusLabels[task.status]
    task.statusSeq = -> taskService.statusSeq[task.status]
    task.canReuploadEvidence = ->
      task.inSubmittedState()
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
    task.scrollCommentsToBottom = ->
      taskService.scrollDown()
    task.applyForExtension = (reason, weeksRequested, onSuccess, onError) ->
      Task.applyForExtension(task, reason, weeksRequested, onSuccess, onError)
    task.assessExtension = (taskCommentID, assessment, onSuccess, onError) ->
      taskService.assessExtension(task, taskCommentID, assessment, onSuccess, onError)
    task.maxWeeksCanExtend = () ->
      Math.ceil(task.definition.localDeadlineDate().diff(task.localDueDate(), 'days') / 7)
    task.minWeeksCanExtend = () ->
      minWeeks = Math.ceil(moment().diff(task.localDueDate(), 'days') / 7)
      if minWeeks < 0 then 0 else minWeeks
    task.staffAlignments = ->
      taskService.staffAlignmentsForTask(task)
    task.timeToDue = ->
      days = task.daysUntilDueDate()
      if days < 0
        return "!"
      else if days < 11
        return "#{days}d"
      else
        return "#{Math.floor(days/7)}w"

    # The due date for a task is the date it is due for this student... this starts at the target date, and can get extended to the deadline date.
    task.localDueDate = ->
      if task.due_date?
        due = new Date(task.due_date)
        return moment({ year: due.getFullYear(), month: due.getMonth(), day: due.getDate() , hour: 23 , minute: 59, second: 59, millisecond :999})
      else
        return task.definition.localDueDate()

    task.localDueDateString = ->
      task.localDueDate().format("ddd D MMM")

    task.startDateString = ->
      task.startDate().format("ddd D MMM")

    task.deadlineString = ->
      task.localDeadlineDate().format("ddd D MMM")

    # What is the deadline for this task?
    task.localDeadlineDate = ->
      return task.definition.localDeadlineDate()

    # When should you start the task?
    task.startDate = ->
      if task.start_date?
        return moment(task.start_date)
      else
        return moment(task.definition.start_date)

    task.isDueSoon = ->
      task.daysUntilDueDate() <= 7 && task.timePastDueDate() < 0 && ! task.inFinalState()
    task.isPastDueDate = ->
      task.timePastDueDate() > 0 && ! task.inSubmittedState()

    # Is the task past the deadline
    task.isOverdue = ->
      task.timePastDeadlineDate() > 0 && (task.status in taskService.overdueStates)
    # Are we approaching the deadline?
    task.isDeadlineSoon = ->
      task.daysUntilDeadlineDate() <= 14 && task.timePastDeadlineDate() < 0 && ! task.inFinalState()

    task.isPastDeadline = ->
      task.timePastDeadlineDate() > 0 && ! task.inSubmittedState()

    task.isDueToday = ->
      task.daysUntilDueDate() == 0 && ! task.inSubmittedState()

    # Return true if between due date and deadline
    task.betweenDueDateAndDeadlineDate = () ->
      ((moment() > task.localDueDate()) && (moment() < task.localDeadlineDate()))

    # Return number of days task is overdue, or false if not overdue
    task.daysPastDeadlineDate = ->
      moment().diff(task.localDeadlineDate(), 'days')

    # Return number of days currently overdue (extensions may be available)
    task.daysPastDueDate = ->
      moment().diff(task.localDueDate(), 'days')

    # Return amount of time past due date (extensions may be available)
    task.timePastDueDate = ->
      moment().diff(task.localDueDate())

    # Return the amount of time past the deadline
    task.timePastDeadlineDate = ->
      moment().diff(task.localDeadlineDate())

    # Return number of days until task is due, or false if already completed
    task.daysUntilDeadlineDate = ->
      task.localDeadlineDate().diff(moment(), 'days')

    # Return number of days until task hits target date, or false if already
    # completed
    task.daysUntilDueDate = ->
      task.localDueDate().diff(moment(), 'days')

    # Determine if submitted before deadline
    task.wasSubmittedOnTime = ->
      deadline = task.localDeadlineDate
      moment(task.submission_date).diff( task.definition.finalDeadlineDate() )

    task.isValidTopTask = ->
      _.includes taskService.validTopTask, task.status

    # Start date helpers
    task.timeUntilStartDate = ->
      task.startDate().diff(moment())
    task.daysUntilStartDate = ->
      task.startDate().diff(moment(), 'days')
    task.isBeforeStartDate = ->
      task.timeUntilStartDate() > 0
    task.timeToStart = ->
      if task.daysUntilStartDate() < 0
        return ""
      else
        days = task.daysUntilStartDate()
        if days < 7
          return "#{days}d"
        else
          return "#{Math.floor(days/7)}w"


    # Return hours until the deadline...
    task.timeUntilDeadlineDescription = ->
      timeToDescription(moment(), task.definition.localDeadlineDate())

    task.timeUntilDueDateDescription = ->
      timeToDescription(moment(), task.localDueDate())

    task.timePastDeadlineDescription = ->
      timeToDescription(task.definition.localDeadlineDate(), moment())

    task.timePastDueDateDescription = ->
      timeToDescription(task.localDueDate(), moment())

    # You can apply for an extension in certain states, if it is before the deadline or was submitted before the deadline, and you can request some extensions still.
    task.canApplyForExtension = ->
      task.inStateThatAllowsExtension() && ( !task.isPastDeadline() || task.wasSubmittedOnTime() ) && task.maxWeeksCanExtend() > 0

    task.inFinalState = ->
      task.status in taskService.finalStatuses
    task.inStateThatAllowsExtension = ->
      task.status in taskService.stateThatAllowsExtension
    task.inSubmittedState = ->
      task.status in taskService.submittedStatuses
    task.inDiscussState = ->
      task.status in taskService.discussionStatuses
    task.inMarkedState = ->
      task.status in taskService.markedStatuses
    task.inAwaitingFeedbackState = ->
      task.status in taskService.awaitingFeedbackStatuses
    task.inCompleteState = ->
      task.status == 'complete'
    task.inTimeExceeded = ->
      task.status == 'time_exceeded'

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
      help = taskService.statusData(task.status).help
      if (task.betweenDueDateAndDeadlineDate() && task.inTimeExceeded())
        help = taskService.statusData('awaiting_extension').help
      help
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
    task.hasQualityPoints = () ->
      task.definition.max_quality_pts > 0 && (task.status in taskService.gradeableStatuses)
    task.matches = (matchText) ->
      project = task.project()
      task.definition.abbreviation.toLowerCase().indexOf(matchText) >= 0 ||
      task.definition.name.toLowerCase().indexOf(matchText) >= 0 ||
      project? && project.matches(matchText)
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
    task.refresh = () ->
      Project.refreshTasks.get { project_id: task.project().project_id, task_definition_id: task.task_definition_id },
          (response) ->
            task.status = response['status']
            task.extensions = response['extensions']
            task.due_date = response['due_date']
          (response) ->
            console.log("Failed to refresh tasks on extension #{response.data.error}")
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
