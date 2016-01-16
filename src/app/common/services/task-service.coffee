angular.module("doubtfire.services.tasks", [])

.factory("taskService", (TaskFeedback, Task, TaskDefinition, alertService, $rootScope) ->
  #
  # The unit service object
  #
  taskService = {}

  taskService.statusKeys = [
    'not_started'
    'fix_and_include'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
    'discuss'
    'demonstrate'
    'complete'
    'fail'
  ]

  taskService.validTopTask = [
    'not_started'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'demonstrate'
    'discuss'
  ]

  taskService.toBeWorkedOn = [
    'not_started'
    'redo'
    'need_help'
    'working_on_it'
  ]

  taskService.statusToDiscuss = [
    'need_help'
    'demonstrate'
    'discuss'
  ]


  taskService.acronymKey =
    RTM: 'ready_to_mark'
    NOS: 'not_started'
    WRK: 'working_on_it'
    HLP: 'need_help'
    RDO: 'redo'
    DNR: 'fix_and_include'
    FIX: 'fix_and_resubmit'
    DIS: 'discuss'
    DEM: 'demonstrate'
    COM: 'complete'
    FAL: 'fail'

  taskService.learningWeight =
    fail:               0.0
    not_started:        0.0
    working_on_it:      0.0
    need_help:          0.0
    redo:               0.1
    fix_and_include:    0.1
    fix_and_resubmit:   0.3
    ready_to_mark:      0.5
    discuss:            0.8
    demonstrate:        0.8
    complete:           1.0

  taskService.statusAcronym =
    ready_to_mark:      'RTM'
    not_started:        'NOS'
    working_on_it:      'WRK'
    need_help:          'HLP'
    redo:               'RDO'
    fix_and_include:    "DNR"
    fix_and_resubmit:   'FIX'
    discuss:            'DIS'
    demonstrate:        'DEM'
    complete:           'COM'
    fail:               'FAL'

  taskService.statusLabels =
    ready_to_mark:      'Ready to Mark'
    not_started:        'Not Started'
    working_on_it:      'Working On It'
    need_help:          'Need Help'
    redo:               'Redo'
    fix_and_include:    "Don't Resubmit"
    fix_and_resubmit:   'Resubmit'
    discuss:            'Discuss'
    demonstrate:        'Demonstrate'
    complete:           'Complete'
    fail:               'Fail'

  taskService.statusIcons =
    ready_to_mark:      'fa fa-thumbs-o-up'
    not_started:        'fa fa-times'
    working_on_it:      'fa fa-bolt'
    need_help:          'fa fa-question-circle'
    redo:               'fa fa-refresh'
    fix_and_include:    'fa fa-stop'
    fix_and_resubmit:   'fa fa-wrench'
    discuss:            'fa fa-check'
    demonstrate:        'fa fa-check'
    complete:           'fa fa-check'
    fail:               'fa fa-times'

  taskService.statusColors =
    # Please make sure this matches task-status-colors.less
    ready_to_mark:     '#0079D8'
    not_started:       '#CCCCCC'
    working_on_it:     '#EB8F06'
    need_help:         '#a48fce'
    fix_and_resubmit:  '#f2d85c'
    fix_and_include:   '#d46b54'
    redo:              '#804000'
    discuss:           '#31b0d5'
    demonstrate:       '#428bca'
    complete:          '#5BB75B'
    fail:              '#d93713'

  taskService.statusSeq =
    not_started:        1
    fail:               2
    fix_and_include:    3
    redo:               4
    need_help:          5
    working_on_it:      6
    ready_to_mark:      7
    fix_and_resubmit:   8
    discuss:            9
    demonstrate:       10
    complete:          11

  taskService.helpTextDesc =
    ready_to_mark:
      'You have completed the Task, and uploaded it for your tutor to assess.'
    not_started:
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
      'Your tutor is happy with your work. To mark as complete, attend class and discuss it with your tutor.'
    demonstrate:
      'Your work looks good. Attend class and demonstrate the task to your tutor to have it marked as Complete.'
    complete:
      'Your tutor is happy with your work and it has been discussed with them.'
    fail:
      'You have not successfully demonstrated the required learning for this task.'

  # Statuses students/tutors can switch tasks to
  taskService.switchableStates =
    student: [
      'not_started'
      'working_on_it'
      'need_help'
      'ready_to_mark'
    ]
    tutor: [
      'complete'
      'discuss'
      'demonstrate'
      'fix_and_resubmit'
      'redo'
      'fix_and_include'
      'fail'
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
    {
      icon: taskService.statusIcons[task.status]
      label: taskService.statusLabels[task.status]
      class: taskService.statusClass(task.status)
      daysOverdue: taskService.daysOverdue(task)
    }

  # Return number of days task is overdue, or false if not overdue
  taskService.daysFromTarget = (task) ->
    dueDate = new Date(task.definition.target_date)
    now = new Date()
    diffTime = now.getTime() - dueDate.getTime()
    diffDays = Math.floor(diffTime / (1000 * 3600 * 24))
    diffDays


  # Return number of days task is overdue, or false if not overdue
  taskService.daysOverdue = (task) ->
    return false if task.status == 'complete'
    diffDays = taskService.daysFromTarget(task)
    return false if diffDays <= 0
    diffDays

  taskService.deleteTask = (task, unit, callback = null) ->
    TaskDefinition.delete( { id: task.id }).$promise.then (
      (response) ->
        unit.task_definitions = _.without unit.task_definitions, task
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
    task.id = response.id
    task.status = response.status
    task.times_assessed = response.times_assessed
    task.updateTaskStatus project, response.new_stats
    task.processing_pdf = response.processing_pdf

    if response.status == status
      $rootScope.$broadcast('UpdateAlignmentChart')
      if project.updateBurndownChart?
        project.updateBurndownChart()
      alertService.add("success", "Status saved.", 2000)
      $rootScope.$broadcast('TaskStatusUpdated')
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
      { project_id: project.project_id, task_definition_id: task.definition.id, trigger: status }
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
