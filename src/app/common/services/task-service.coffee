angular.module("doubtfire.services.tasks", [])

.factory("taskService", (TaskFeedback, Task, TaskDefinition, alertService) ->
  #
  # The unit service object
  #
  taskService = {}

  taskService.statusKeys = [
    'not_submitted'
    'fix_and_include'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
    'discuss'
    'complete'
  ]

  taskService.acronymKey =
    RTM: 'ready_to_mark'
    NOS: 'not_submitted'
    WRK: 'working_on_it'
    HLP: 'need_help'
    RDO: 'redo'
    DNR: 'fix_and_include'
    FIX: 'fix_and_resubmit'
    DIS: 'discuss'
    COM: 'complete'

  taskService.learningWeight =
    ready_to_mark:      0.7
    not_submitted:      0.0
    working_on_it:      0.0
    need_help:          0.0
    redo:               0.2
    fix_and_include:    0.2
    fix_and_resubmit:   0.4
    discuss:            0.7
    complete:           0.8

  taskService.statusAcronym =
    ready_to_mark:      'RTM'
    not_submitted:      'NOS'
    working_on_it:      'WRK'
    need_help:          'HLP'
    redo:               'RDO'
    fix_and_include:    "DNR"
    fix_and_resubmit:   'FIX'
    discuss:            'DIS'
    complete:           'COM'

  taskService.statusLabels =
    ready_to_mark:      'Ready to Mark'
    not_submitted:      'Not Started'
    working_on_it:      'Working On It'
    need_help:          'Need Help'
    redo:               'Redo'
    fix_and_include:    "Don't Resubmit"
    fix_and_resubmit:   'Resubmit'
    discuss:            'Discuss'
    complete:           'Complete'

  taskService.statusIcons =
    ready_to_mark:      'fa fa-thumbs-o-up'
    not_submitted:      'fa fa-times'
    working_on_it:      'fa fa-bolt'
    need_help:          'fa fa-question-circle'
    redo:               'fa fa-refresh'
    fix_and_include:    'fa fa-stop'
    fix_and_resubmit:   'fa fa-wrench'
    discuss:            'fa fa-check'
    complete:           'fa fa-check-square-o'

  taskService.helpTextDesc =
    ready_to_mark:
      'You have completed the Task, and uploaded it for your tutor to assess.'
    not_submitted:
      'You have not yet started the Task.'
    working_on_it:
      'You are working on the task, but it is not yet ready to assess.'
    need_help:
      'You are working on the task but would like some help to get it complete.'
    redo:
      'Your tutor wants you to start this task from scratch.'
    fix_and_include:
      'Your tutor wants you to stop submitting this task and include it fixed in your portfolio.'
    fix_and_resubmit:
      'Your tutor wants you to fix something and resubmit it for review again.'
    discuss:
      'Your tutor is happy with your work. To mark as complete, attend the lab and discuss it with your tutor.'
    complete:
      'Your tutor is happy with your work and it has been discussed with them.'

  # Statuses students/tutors can switch tasks to
  taskService.switchableStates =
    student: [
      'not_submitted'
      'working_on_it'
      'need_help'
      'ready_to_mark'
    ]
    tutor: [
      'discuss'
      'complete'
      'fix_and_resubmit'
      'fix_and_include'
      'redo'
    ]

  # This function gets the status CSS class for the indicated status
  taskService.statusClass = (status) -> _.trim(_.dasherize(status))

  # This function gets the status text for the indicated status
  taskService.statusText = (status) -> taskService.statusLabels[status]

  # This function gets the help text for the indicated status
  taskService.helpText = (status) -> taskService.helpTextDesc[status]

  taskService.taskDefinitionFn = (unit) ->
    (task) ->
      unit.taskDef(task.task_definition_id)

  # Return an icon and label for the task
  taskService.statusData = (task) ->
    { icon: taskService.statusIcons[task.status], label: taskService.statusLabels[task.status], class: taskService.statusClass(task.status), daysOverdue: taskService.daysOverdue(task) }

  # Return number of days task is overdue, or false if not overdue
  taskService.daysOverdue = (task) ->
    return false if task.status == 'complete'
    dueDate = new Date(task.definition.target_date)
    now = new Date()
    diffTime = now.getTime() - dueDate.getTime()
    diffDays = Math.floor(diffTime / (1000 * 3600 * 24))
    return false if diffDays <= 0
    diffDays

  taskService.deleteTask = (task, unit, callback = null) ->
    TaskDefinition.delete( { id: task.id }).$promise.then (
      (response) ->
        unit.task_definitions = unit.task_definitions.filter (e) -> e != task
        alertService.add("success", "Task Deleted", 2000)
        callback?(response)
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
        else
          alertService.add("danger", "Unexpected error connecting to Doubtfire.", 6000)
    )

  taskService.indexOf = (status) ->
    _.indexOf(taskService.statusKeys, status)

  # Return a list of all the the status values and icons
  taskService.allStatusData = () ->
    result = []
    angular.forEach taskService.statusKeys, (sk) ->
      result.push({ icon: taskService.statusIcons[sk], label: taskService.statusLabels[sk], class: taskService.statusClass(sk) })
    result

  taskService.processTaskStatusChange = (unit, project, task, status, response) ->
    task.status = response.status
    task.updateTaskStatus project, response.new_stats
    task.processing_pdf = response.processing_pdf

    if response.status == status
      alertService.add("success", "Status saved.", 2000)
      if response.other_projects?
        _.each response.other_projects, (details) ->
          proj = unit.findStudent(details.id)
          if proj?
            task.updateTaskStatus proj, details.new_stats
    else
      alertService.add("info", "Status change was not changed.", 4000)


  taskService.updateTaskStatus = (unit, project, task, status) ->
    oldStatus = task.status
    Task.update(
      { id: task.id, trigger: status }
      # Success
      (value) ->
        taskService.processTaskStatusChange unit, project, task, status, value
      # Fail
      (value) ->
        task.status = oldStatus
        alertService.add("danger", value.data.error, 6000)
    )

  taskService.recreatePDF = (task, success) ->
    TaskFeedback.update { id: task.id },
      (value) ->  #success
        if value.result == "false"
          alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 2000)
        else
          task.processing_pdf = true
          alertService.add("info", "Task PDF will be recreated.", 2000)

          if success
            success()
      (value) -> #fail
        alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 2000)

  taskService
)