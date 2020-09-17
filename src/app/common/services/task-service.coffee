angular.module("doubtfire.common.services.tasks", [])

.factory("taskService", (TaskFeedback, TaskComment, DiscussionComment, Task, TaskDefinition, alertService, $filter, $rootScope, $timeout, analyticsService, GradeTaskModal, gradeService, ConfirmationModal, ProgressModal, UploadSubmissionModal, currentUser, groupService, emojiService) ->
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

  # All status other than those that are final - these are sorted in the student task list
  taskService.validTopTask = [
    'not_started'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
    'discuss'
    'demonstrate'
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

  # What are the states that are associated with tutor actions...
  # TODO: This needs to be reworked, this actually means we are
  # not waiting on a new submission =  either waiting for the tutor
  # to mark it, or waiting on a discussion between student and tutor.
  taskService.submittedStatuses = [
    'do_not_resubmit'
    'ready_to_mark'
    'discuss'
    'demonstrate'
    'complete'
    'fail'
    'time_exceeded'
  ]

  taskService.awaitingFeedbackStatuses = [
    'ready_to_mark'
  ]

  # Which states can a task be considered to be overdue
  taskService.overdueStates = [
    'not_started'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
  ]

  # Which states are considered final
  taskService.finalStatuses = [
    'complete'
    'fail'
    'do_not_resubmit'
    'time_exceeded'
  ]

  taskService.gradeableStatuses = [
    'discuss'
    'demonstrate'
    'complete'
  ]

  taskService.discussionStatuses = [
    'discuss'
    'demonstrate'
  ]

  taskService.stateThatAllowsExtension = [
    'not_started'
    'redo'
    'need_help'
    'working_on_it'
    'fix_and_resubmit'
    'ready_to_mark'
    'time_exceeded'
  ]

  taskService.pdfRegeneratableStatuses = [
    'demonstrate'
    'ready_to_mark'
    'discuss'
    'complete'
    'time_exceeded'
    'fail'
    'fix_and_resubmit'
    'do_not_resubmit'
    'redo'
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
      action: "It is now your responsibility to ensure this task is at an adequate standard in your portfolio. You should fix your work according to your tutor's prior feedback and include a corrected version in your portfolio."
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
      reason: "This work was submitted after the deadline, having missed both the target date and deadline."
      action: "Work submitted after the feedback deadline will not be checked by tutors prior to the portfolio assessment. You will need to ensure this task is at an adequate standard in your portfolio."
    awaiting_extension:
      detail: "Time limit exceeded, awaiting extension"
      reason: "This work was submitted after the deadline, having missed both the target date and deadline but is awaiting an extension."
      action: "You require an extension to have this work assessed. If an extension is granted the task will be ready for feedback, and will be reviewed by your tutor."

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

  # Which status should not show up in the task status drop down
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
      time_exceeded: ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']
      fail:  ['ready_to_mark', 'not_started', 'working_on_it', 'need_help']

  taskService.currentReplyID = { id: null }

  # This function gets the status CSS class for the indicated status
  taskService.statusClass = (status) -> _.trim(_.kebabCase(status))

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

  # Trigger for new status
  taskService.triggerTransition = (task, status, unitRole) ->
    throw Error "Not a valid status key" unless _.includes(taskService.statusKeys, status)
    return if task.status == status
    requiresFileUpload = _.includes(['ready_to_mark', 'need_help'], status) && task.requiresFileUpload()
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

  doDeleteTask = (task, unit, callback = null) ->
    TaskDefinition.delete( { unit_id: unit.id, id: task.id }).$promise.then (
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
    task.due_date = response.due_date
    task.extensions = response.extensions
    task.grade = response.grade
    if response.status == status
      project.updateBurndownChart?()
      alertService.add("success", "Status saved.", 2000)
      if task.inTimeExceeded() && !task.isPastDeadline()
        alertService.add('warning', "Request an extension, or wait for your extension request to be granted, to have this task assessed.")

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

  hoursBetween = (time1, time2) ->
    return Math.floor(Math.abs(new Date(time1) - new Date(time2))/1000/60/60)

  taskService.isBubbleComment = (commentType) ->
    return (["text", "discussion", "audio", "image", "pdf"].includes(commentType))

  taskService.mapComments = (comments) ->
    return comments if !comments? || comments.length == 0
    comments[0].should_show_timestamp = true

    for i in [0...comments.length]
      # Turn the emoji colons into emojis for rendering.
      comments[i].comment = emojiService.colonsToNative(comments[i].comment)

      # If the comment is a reply to an earlier comment
      if comments[i].reply_to_id?
        comments[i].original_comment = $filter('filter')(comments, {'id':comments[i].reply_to_id})[0]

      initials = comments[i].author.name.split(" ")
      comments[i].initials = ("#{initials[0][0]}#{initials[1][0]}").toUpperCase()
      comments[i].author_is_me = comments[i].author.id == currentUser.profile.id

      authorID = comments[i].author.id
      timeOfMessage = comments[i].created_at

      # if the comment is proceeded by a different author's comment, or the time between comments
      # is significant, mark it as start of end of series, then start a new series proceeding.
      if (authorID != comments[i+1]?.author.id || hoursBetween(timeOfMessage, comments[i+1]?.created_at) > 3) # IDs match
        comments[i].should_show_avatar = true
        comments[i+1]?.should_show_timestamp = true
      else
        comments[i].should_show_avatar = false
        comments[i+1]?.should_show_timestamp = false

      # if the comment is preceeded by a non-conent comment, mark it as start of series.
      if (taskService.isBubbleComment(comments[i].type) && !taskService.isBubbleComment(comments[i-1]?.type))
        comments[i].first_in_series = true

      # if the comment is proceeded by a non-conent comment, mark it as end of series.
      if (taskService.isBubbleComment(comments[i].type) && !taskService.isBubbleComment(comments[i+1]?.type))
        comments[i].should_show_avatar = true

    comments[comments.length-1].should_show_avatar = true
    comments

  #============================================================================
  #ADD COMMENT
  taskService.addComment = (task, textString, commentType, replyID, success, failure) ->
    TaskComment.create { project_id: task.project().project_id, task_definition_id: task.task_definition_id, comment: textString, type: commentType, reply_to_id: replyID},
      (response) ->
        unless task.comments?
          task.comments = []
        task.comments.push(response)
        taskService.mapComments(task.comments)
        if success? and _.isFunction success
          success(response)
        analyticsService.event "View Task Comments", "Added new comment"
      (response) ->
        if failure? and _.isFunction failure
          failure(response)

  #============================================================================
  #SCROLL DOWN
  taskService.scrollDown = ->
    $timeout ->
      objDiv = document.querySelector("task-comments-viewer .comments-body")
      wrappedResult = angular.element(objDiv)
      wrappedResult[0].scrollTop = wrappedResult[0].scrollHeight

  #============================================================================
  #ADD MEDIA COMMENT
  taskService.addMediaComment = (task, media, onSuccess, onError) ->
    form = new FormData()
    form.append 'attachment', media

    if taskService.currentReplyID.id?
      reply_to_id = taskService.currentReplyID.id
      taskService.currentReplyID.id = null

    TaskComment.create_media {project_id: task.project().project_id, task_definition_id: task.task_definition_id, reply_to_id: reply_to_id}, form,
      (response) -> #success
        unless task.comments?
          task.comments = []
        task.comments.push(response)
        taskService.mapComments(task.comments)
        onSuccess(response)
      (response) -> #failure
        onError(response)

  #Add discussion comment
  taskService.addDiscussionComment = (task, prompts, onSuccess, onError) ->
    form = new FormData()
    temp = []

    for prompt in prompts
      form.append('attachments[]', prompt)

    res = DiscussionComment.createDiscussion.create_media {project_id: task.project().project_id, task_definition_id: task.task_definition_id, type: "discussion"}, form,
      (response) -> #success
        unless task.comments?
          task.comments = []
        task.comments.push(response)
        taskService.mapComments(task.comments)
        onSuccess(response)
      (response) -> #failure
        onError(response)

    $timeout ->
      objDiv = document.querySelector("task-comments-viewer .comments-body")
      wrappedResult = angular.element(objDiv)
      wrappedResult[0].scrollTop = wrappedResult[0].scrollHeight

  taskService.postDiscussionReply = (task, commentID, replyAudio, onSuccess, onError) ->
    form = new FormData()
    form.append 'attachment', replyAudio

    DiscussionComment.postDiscussionReply.create_media {project_id: task.project().project_id, task_definition_id: task.task_definition_id, task_comment_id: commentID}, form,
      (response) -> #success)
        onSuccess(response)
      (response) -> #failure
        onError(response)

  taskService.getDiscussionComment = (task, commentID, onSuccess, onError) ->
    DiscussionComment.getDiscussion.get {project_id: task.project().project_id, task_definition_id: task.task_definition_id, task_comment_id: commentID},
      (response) -> #success)
        onSuccess(response)
      (response) -> #failure
        onError(response)

  taskService.assessExtension = (task, taskCommentID, assessment, onSuccess, onError) ->
    interceptSuccess = (response) ->
      task.due_date = response.data.due_date
      task.extensions = response.data.extensions
      task.status = response.data.task_status
      task.project().updateBurndownChart()
      task.project().calcTopTasks() # Sort the task list again
      onSuccess(response)

    Task.assessExtension(task, taskCommentID, assessment, interceptSuccess, onError)

  taskService
)
