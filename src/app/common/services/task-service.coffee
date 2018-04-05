angular.module("doubtfire.common.services.tasks", [])

.factory("taskService", (TaskFeedback, TaskComment, Task, TaskDefinition, alertService, $filter, $rootScope, analyticsService, GradeTaskModal, gradeService, ConfirmationModal, ProgressModal, UploadSubmissionModal, currentUser, groupService) ->
  #
  # The unit service object
  #
  taskService = {}

  taskService.statusKeys = [
    'not_started'
    'do_not_resubmit'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
    'discuss'
    'demonstrate'
    'complete'
    'fail'
    'time_exceeded'
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

  taskService.gradeableStatuses = [
    'discuss'
    'demonstrate'
    'complete'
  ]

  taskService.terminalStatuses = [
    'demonstrate'
    'discuss'
    'do_not_resubmit'
    'complete'
    'fail'
    'time_exceeded'
  ]

  taskService.pdfRegeneratableStatuses = [
    'demonstrate'
    'ready_to_mark'
    'discuss'
    'complete'
  ]

  taskService.submittableStatuses = [
    'ready_to_mark'
    'need_help'
  ]

  taskService.markedStatuses = [
    'redo'
    'fail'
    'fix_and_resubmit'
    'do_not_resubmit'
    'discuss'
    'demonstrate'
    'complete'
  ]

  taskService.acronymKey =
    RTM: 'ready_to_mark'
    NOS: 'not_started'
    WRK: 'working_on_it'
    HLP: 'need_help'
    RDO: 'redo'
    DNR: 'do_not_resubmit'
    FIX: 'fix_and_resubmit'
    DIS: 'discuss'
    DEM: 'demonstrate'
    COM: 'complete'
    FAL: 'fail'
    TIE: 'time_exceeded'

  taskService.learningWeight =
    fail:               0.0
    not_started:        0.0
    working_on_it:      0.0
    need_help:          0.0
    redo:               0.1
    do_not_resubmit:    0.1
    fix_and_resubmit:   0.3
    ready_to_mark:      0.5
    discuss:            0.8
    demonstrate:        0.8
    complete:           1.0
    time_exceeded:      0.3

  taskService.statusAcronym =
    ready_to_mark:      'RTM'
    not_started:        'NOS'
    working_on_it:      'WRK'
    need_help:          'HLP'
    redo:               'RDO'
    do_not_resubmit:    "DNR"
    fix_and_resubmit:   'FIX'
    discuss:            'DIS'
    demonstrate:        'DEM'
    complete:           'COM'
    fail:               'FAL'
    time_exceeded:      'TIE'

  taskService.statusLabels =
    ready_to_mark:      'Ready for Feedback'
    not_started:        'Not Started'
    working_on_it:      'Working On It'
    need_help:          'Need Help'
    redo:               'Redo'
    do_not_resubmit:    'Feedback Exceeded'
    fix_and_resubmit:   'Resubmit'
    discuss:            'Discuss'
    demonstrate:        'Demonstrate'
    complete:           'Complete'
    fail:               'Fail'
    time_exceeded:      'Time Exceeded'

  taskService.statusIcons =
    ready_to_mark:      'fa fa-thumbs-o-up'
    not_started:        'fa fa-pause'
    working_on_it:      'fa fa-bolt'
    need_help:          'fa fa-question-circle'
    redo:               'fa fa-refresh'
    do_not_resubmit:    'fa fa-low-vision'
    fix_and_resubmit:   'fa fa-wrench'
    discuss:            'fa fa-commenting'
    demonstrate:        'fa fa-commenting'
    complete:           'fa fa-check'
    fail:               'fa fa-times'
    time_exceeded:      'fa fa-clock-o'

  taskService.statusColors =
    # Please make sure this matches task-status-colors.less
    ready_to_mark:     '#0079D8'
    not_started:       '#CCCCCC'
    working_on_it:     '#EB8F06'
    need_help:         '#a48fce'
    fix_and_resubmit:  '#f2d85c'
    do_not_resubmit:   '#d46b54'
    redo:              '#804000'
    discuss:           '#31b0d5'
    demonstrate:       '#428bca'
    complete:          '#5BB75B'
    fail:              '#d93713'
    time_exceeded:     '#d93713'

  taskService.statusSeq =
    not_started:        1
    fail:               2
    do_not_resubmit:    3
    time_exceeded:      4
    redo:               5
    need_help:          6
    working_on_it:      7
    ready_to_mark:      8
    fix_and_resubmit:   9
    discuss:           10
    demonstrate:       11
    complete:          12


  taskService.helpDescriptions =
    # detail = in a brief context to the student
    # reason = reason for this status
    # action = action student can take
    ready_to_mark:
      detail: "Submitted this task for feedback"
      reason: "You have finished working on the task and have uploaded it for your tutor to assess."
      action: "No further action is required. Your tutor will change this task status once they have assessed it."
    not_started:
      detail: "Task not started"
      reason: "You have not yet started the Task."
      action: "Depending on when the target date is, you should start this task soon."
    working_on_it:
      detail: "Working on the task"
      reason: "You are working on the task, but it is not yet ready to assess."
      action: "Finish working on this task and then set it to ready for feedback."
    need_help:
      detail: "Need help for the task"
      reason: "You are working on the task but would like some help to get it complete."
      action: "Upload the task with what you have completed so far and add a comment on what you would like help on."
    redo:
      detail: "Start this task from scratch"
      reason: "You appeared to have misunderstood what is required for this task, many deliverables were missing or the marking criteria was largely not met."
      action: "You should reconsider your approach to this task. Review the task resources and task guide instructions. Check the deliverables carefully. Consider getting help from your tutor and/or lecturer."
    do_not_resubmit:
      detail: "Feedback will no longer be given"
      reason: "This work is not complete to an acceptable standard and your tutor will not reassess it again."
      action: "It is now your responsibility to ensure this task is at an adequate standard in your portfolio. You should fix your work according to your tutor's prior feedback and include a corrected version in your portfolio. This task will not be considered to be Complete, which may limit your maximum grade."
    fix_and_resubmit:
      detail: "Your submission requires some more work"
      reason: "It looks like your work is on the right track, but it does require some extra work to achieve the required standard."
      action: "Review your submission and the feedback from your tutor. Fix the issues identified, and resubmit it to be reassessed. Make sure to check your submission thoroughly, and note any limit on the number of times each task can be reassessed."
    discuss:
      detail: "You're almost complete!"
      reason: "Your work looks good and your tutor believes it is complete."
      action: "To mark as complete, attend class and discuss it with your tutor."
    demonstrate:
      detail: "You're almost complete!"
      reason: "Your work looks good and your tutor believes it is complete."
      action: "To mark as complete, attend class and demonstrate how your submission works to your tutor."
    complete:
      detail: "You are finished with this task 🎉"
      reason: "Your tutor is happy with your work and it has been discussed with them."
      action: "No further action required. Move onto the next task, or go party if everything is done."
    fail:
      detail: "You have failed this task"
      reason: "You have not successfully demonstrated the required learning for this task. This may be due to plagiarism detection or assessment under testing conditions."
      action: "You should discuss this with your tutor and/or the convenor."
    time_exceeded:
      detail: "Time limit exceeded"
      reason: "This work was submitted after the deadline, having missed both the target and deadline."
      action: "It is now your responsibility to ensure this task is at an adequate standard in your portfolio. This task will not be considered to be Complete, which may limit your maximum grade."

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
      'do_not_resubmit'
      'fail'
    ]

  taskService.rejectFutureStates =
      not_started: []
      working_on_it: []
      need_help: []
      ready_to_mark: []
      complete: ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']
      discuss:  ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']
      demonstrate:  ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']
      fix_and_resubmit:  []
      redo:  []
      do_not_resubmit:  ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']
      time_exceeded: []
      fail:  ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']

  # This function gets the status CSS class for the indicated status
  taskService.statusClass = (status) -> _.trim(_.dasherize(status))

  # This function gets the status text for the indicated status
  taskService.statusText = (status) -> taskService.statusLabels[status]

  # This function gets the help text for the indicated status
  taskService.helpDescription = (status) -> taskService.helpDescriptions[status]

  taskService.taskDefinitionFn = (unit) ->
    (task) ->
      unit.taskDef(task.task_definition_id)

  # Return an icon and label for the task
  taskService.statusData = (data) ->
    # provided a task not a status
    status = if data.status? then data.status else data
    {
      status: status
      icon: taskService.statusIcons[status]
      label: taskService.statusLabels[status]
      class: taskService.statusClass(status)
      help: taskService.helpDescription(status)
    }

  # Return whether task is a group task
  taskService.isGroupTask = (task) ->
    groupService.isGroupTask(task)

  # Returns the alignments for this task
  taskService.staffAlignmentsForTask = (task) ->
    task.unit().staffAlignmentsForTaskDefinition(task.definition)

  # Return number of days until task hits target date, or false if already
  # completed
  taskService.daysUntilTargetDate = (task) ->
    return false if task.status == 'complete'
    moment(task.definition.target_date).diff(moment(), 'days')

  # Return number of days until task is due, or false if already completed
  taskService.daysUntilDueDate = (task) ->
    return false if !task.definition.due_date? || task.status == 'complete'
    moment(task.definition.due_date).diff(moment(), 'days')

  # Return number of days task is overdue from target, or false if not
  taskService.daysPastTargetDate = (task) ->
    return false if task.status == 'complete'
    diffDays = moment().diff(moment(task.definition.target_date), 'days')
    return false if !diffDays? || diffDays <= 0
    diffDays

  # Return number of days task is overdue, or false if not overdue
  taskService.daysPastDueDate = (task) ->
    return false if task.status == 'complete' || !task.definition.due_date?
    diffDays = moment().diff(moment(task.definition.due_date), 'days')
    return false if !diffDays? || diffDays <= 0
    diffDays

  # Trigger for new status
  taskService.triggerTransition = (task, status, unitRole) ->
    throw Error "Not a valid status key" unless _.includes(taskService.statusKeys, status)
    return if task.status == status
    requiresFileUpload = _.includes(['ready_to_mark', 'need_help'], status) && task.definition.upload_requirements.length > 0
    if requiresFileUpload
      taskService.presentTaskSubmissionModal(task, status)
    else
      taskService.updateTaskStatus(task.unit(), task.project(), task, status)
      asUser = if unitRole? then unitRole.role else 'Student'
      analyticsService.event('Task Service', "Updated Status as #{asUser}", taskService.statusLabels[status])

  taskService.presentTaskSubmissionModal = (task, status, reuploadEvidence) ->
    oldStatus = task.status
    task.status = status
    modal = UploadSubmissionModal.show(task, reuploadEvidence)
    # Modal failed to present
    unless modal?
      task.status = oldStatus
      return
    modal.result.then(
      # Grade was selected (modal closed with result)
      (response) ->
        null
      # Grade was not selected (modal was dismissed)
      (dismissed) ->
        task.status = oldStatus
        alertService.add("info", "Submission cancelled. Status was reverted.", 6000)
    )

  # Whether or not new submissions can be made on a task
  taskService.canReuploadEvidence = (task) ->
    _.includes(taskService.terminalStatuses, task.status)

  doDeleteTask = (task, unit, callback = null) ->
    TaskDefinition.delete( { id: task.id }).$promise.then (
      (response) ->
        unit.task_definitions = _.without unit.task_definitions, task
        alertService.add("success", "Task Deleted", 2000)
        callback?(response)
        analyticsService.event 'Task Service', 'Deleted Task Definition'
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
        else
          alertService.add("danger", "Unexpected error connecting to Doubtfire.", 6000)
        analyticsService.event 'Task Service', 'Failed to Delete Task Definition'
    )

  taskService.deleteTask = (task, unit, callback = null) ->
    ConfirmationModal.show "Delete Task #{task.abbreviation}",
      'Are you sure you want to delete this task? This action is final and will delete student work associated with this task.',
      ->
        promise = doDeleteTask task, unit, null
        ProgressModal.show "Deleting Task #{task.abbreviation}", 'Please wait while student projects are updated.', promise

  taskService.plagiarismDetected = (task) ->
    task.similar_to_count - task.similar_to_dismissed_count > 0

  taskService.indexOf = (status) ->
    _.indexOf(taskService.statusKeys, status)

  # Return a list of all the the status values and icons
  taskService.allStatusData = ->
    result = []
    angular.forEach taskService.statusKeys, (sk) ->
      result.push({ icon: taskService.statusIcons[sk], label: taskService.statusLabels[sk], class: taskService.statusClass(sk) })
    result

  taskService.processTaskStatusChange = (unit, project, task, status, response) ->
    task.id = response.id
    task.times_assessed = response.times_assessed
    task.submisson_date = response.submisson_date
    task.updateTaskStatus response.status, response.new_stats
    task.processing_pdf = response.processing_pdf
    task.grade = response.grade
    if response.status == status
      project.updateBurndownChart?()
      alertService.add("success", "Status saved.", 2000)
      if response.other_projects?
        _.each response.other_projects, (details) ->
          proj = unit.findStudent(details.id) if unit.students?
          if proj?
            # Update the other project's task status overview
            task.updateTaskStatus response.status, details.new_stats
            # Update the other project's task
            other_task = proj.findTaskForDefinition(task.definition.id)
            if other_task?
              other_task.grade = response.grade
              other_task.status = response.status
    else
      alertService.add("info", "Status change was not changed.", 4000)


  taskService.updateTaskStatus = (unit, project, task, status, success, failure) ->
    oldStatus = task.status
    updateFunc = ->
      Task.update { project_id: project.project_id, task_definition_id: task.definition.id, trigger: status, grade: task.grade, quality_pts: task.quality_pts },
        # Success
        (value) ->
          taskService.processTaskStatusChange unit, project, task, status, value
          analyticsService.event 'Task Service', 'Updated Task Status', status
          analyticsService.event 'Task Service', 'Updated Task Grade', gradeService.grades[value.grade]
          success?()
        # Fail
        (value) ->
          task.status = oldStatus
          alertService.add("danger", value.data.error, 6000)
          analyticsService.event 'Task Service', 'Failed to Update Task Status', status
          failure?()
    # Must provide grade if graded and in a final complete state
    if (task.definition.is_graded or task.definition.max_quality_pts > 0) and status in taskService.gradeableStatuses
      GradeTaskModal.show(task)?.result.then(
        # Grade was selected (modal closed with result)
        (response) ->
          task.grade = response.selectedGrade
          task.quality_pts = response.qualityPts
          updateFunc()
        # Grade was not selected (modal was dismissed)
        ->
          task.status = oldStatus
          alertService.add "info", "No grade was specified to a graded task - status reverted", 6000
      )
    else
      updateFunc()

  taskService.recreateSubmissionPdf = (task, onSuccess, onFailure) ->
    TaskFeedback.update { task_definition_id: task.definition.id, project_id: task.project().project_id },
      (value) ->  #success
        if value.result == "false"
          alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 2000)
          analyticsService.event 'Task Service', 'Failed to Recreate PDF'
        else
          task.processing_pdf = true
          alertService.add("info", "Task PDF will be recreated.", 2000)
          analyticsService.event 'Task Service', 'Recreated PDF'
          onSuccess?()
      (value) -> #fail
        alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 2000)
        analyticsService.event 'Task Service', 'Failed to Recreate PDF'
        onFailure?()

  taskService.taskIsGraded = (task) ->
    task? and task.definition.is_graded and task.grade?

  taskService.taskKeyFromString = (taskKeyString) ->
    taskKeyComponents = taskKeyString?.split('/')
    if taskKeyComponents
      studentId = _.first(taskKeyComponents)
      taskDefAbbr = _.last(taskKeyComponents)
      return unless _.isString(studentId) && _.isString(taskDefAbbr)
    {
      studentId: studentId
      taskDefAbbr: taskDefAbbr
    }

  taskService.taskKeyToUrlString = (task) ->
    key = task.taskKey()
    "#{key.studentId}/#{key.taskDefAbbr}"

  taskService.taskKeyToIdString = (task) ->
    key = task.taskKey()
    "task-key-#{key.studentId}-#{key.taskDefAbbr}".replace(/[.#]/g, "-")

  taskService.taskKey = (task) ->
    {
      studentId: task.project().student_id
      taskDefAbbr: task.definition.abbreviation
    }

  taskService.hasTaskKey = (task, key) ->
    _.isEqual(task?.taskKey(), key)

  # Map extra front-end details to comment
  taskService.mapComment = (comment) ->
    initials = comment.author.name.split(" ")
    comment.initials = ("#{initials[0][0]}#{initials[1][0]}").toUpperCase()
    comment.author_is_me = comment.author.id == currentUser.profile.id
    comment

  taskService.addComment = (task, textString, success, failure) ->
    TaskComment.create { project_id: task.project().project_id, task_definition_id: task.task_definition_id, comment: textString },
      (response) ->
        unless task.comments?
          task.comments = []
        task.comments.unshift(taskService.mapComment(response))
        if success? and _.isFunction success
          success(response)
        analyticsService.event "View Task Comments", "Added new comment"
      (response) ->
        if failure? and _.isFunction failure
          failure(response)

  taskService
)
