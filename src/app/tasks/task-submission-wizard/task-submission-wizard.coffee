angular.module('doubtfire.tasks.task-submission-wizard', [])

#
# Wizard that helps new tasks to be uploaded
#
.directive('taskSubmissionWizard', ->
  restrict: 'E'
  replace: true
  scope:
    task: '='
    project: '='
    unit: '='
    assessingUnitRole: '=?'
  templateUrl: 'tasks/task-submission-wizard/task-submission-wizard.tpl.html'
  controller: ($scope, $timeout, Task, taskService, alertService, projectService, groupService, analyticsService) ->
    # Upload types which are also task states
    UPLOAD_STATUS_TYPES = ['ready_to_mark', 'need_help']
    UPLOAD_TYPES = ['ready_to_mark', 'need_help', 'reupload_evidence']

    # States in the Wizard
    $scope.states = {
      initial: 'initial',
      uploadFiles: 'uploadFiles',
      groupMemberContribution: 'groupMemberContribution'
    }

    # Reverts changes to task state made during the upload
    revertChanges = (task) ->
      if task.definition.upload_requirements.length > 0 and $scope.uploadType? and $scope.uploadType in UPLOAD_STATUS_TYPES and $scope.oldStatus? and $scope.oldStatus isnt task.status
        # Revert it
        task.status = $scope.oldStatus if $scope.oldStatus?
        alertService.add("info", "No file(s) uploaded. Status reverted.", 4000)

    # Watch the task, and reinitialise oldStatus if it changes
    $scope.$watch 'task', (task, oldTask) ->
      # Reset initial state
      $scope.state = $scope.states.initial
      # Revert changes if need be
      revertChanges(oldTask)
      # Copy in the old status
      $scope.oldStatus = angular.copy $scope.task.status
      # If already set to RTM or needs help, then default to one of these,
      # otherwise it's null
      $scope.uploadType  = if task.status in UPLOAD_STATUS_TYPES then task.status
      # Redo the file uploader details
      $scope.files = {}
      for upload in task.definition.upload_requirements
        $scope.files[upload.key] = { name: upload.name, type: upload.type }
      # Re-generate the submission URL and numberOfFiles
      $scope.url = Task.generateSubmissionUrl $scope.project, $scope.task
      $scope.numberOfFiles = task.definition.upload_requirements.length
      # Set if in group task
      $scope.isGroupTask = groupService.isGroupTask($scope.task)
      $scope.inGroupForTask = projectService.getGroupForTask($scope.project, $scope.task)?

    # Watch the task's status and set it as the new upload type if it changes
    $scope.$watch 'task.status', (newStatus) ->
      return if newStatus is $scope.uploadType
      uploadType = if newStatus in UPLOAD_STATUS_TYPES then newStatus
      $scope.setUploadType(uploadType)

    # Pass this to the file uploader to see if file is uploading or not
    $scope.isUploading = null

    # Hover-over label helper text
    $scope.helpLabel = ''
    $scope.setHelpLabel = (text = '') ->
      $scope.helpLabel = text

    # The variant upload states
    $scope.uploadTypes =
      ready_to_mark:
        icon: taskService.statusIcons['ready_to_mark']
        text: taskService.statusLabels['ready_to_mark']
        class: 'ready-to-mark'
        hide: $scope.task.status in ['demonstrate', 'discuss', 'do_not_resubmit', 'complete', 'fail']
      need_help:
        icon: taskService.statusIcons['need_help']
        text: taskService.statusLabels['need_help']
        class: 'need-help'
        hide: $scope.task.status in ['demonstrate', 'discuss', 'do_not_resubmit', 'complete', 'fail']
      reupload_evidence:
        icon: 'fa fa-recycle'
        text: "new evidence for portfolio"
        class: 'btn-info'
        # Upload evidence only okay in a final state
        hide: $scope.task.status not in ['demonstrate', 'discuss', 'do_not_resubmit', 'complete', 'fail']

    # Switch the status if the upload type matches a state
    $scope.setUploadType = (type) ->
      $scope.uploadType = type

      if type in UPLOAD_STATUS_TYPES
        $scope.task.status = type

      if type in UPLOAD_TYPES
        # Progress to next state... depends on if it's a group task or not
        $scope.state = if $scope.isGroupTask and $scope.state isnt $scope.states.uploadFiles then $scope.states.groupMemberContribution else $scope.states.uploadFiles


    # When upload is successful, update the task status on the back-end
    $scope.onSuccess = (response) ->
      # Update the project's task stats and burndown data
      updateTaskStatusFunc = ->
        taskService.processTaskStatusChange $scope.unit, $scope.project, $scope.task, response.status, response
        $scope.oldStatus = angular.copy $scope.task.status
      # Perform as timeout to show 'Upload Complete'
      $timeout updateTaskStatusFunc, 1500
      asUser = if $scope.assessingUnitRole? then $scope.assessingUnitRole.role else 'Student'
      analyticsService.event 'Task Submit Form', "Updated Status as #{asUser}", taskService.statusLabels[$scope.task.status]
      analyticsService.event 'Task Submit Form', "Files Uploaded", undefined, $scope.numberOfFiles

    $scope.onComplete = ->
      $scope.state = $scope.states.initial

    #
    # When the scope leaves focus, revert all changes if need be
    #
    $scope.$on '$destroy', ->
      revertChanges($scope.task)

    # Allow upload
    $scope.recreateTask = ->
      # No callback
      taskService.recreatePDF $scope.task, null

    $scope.allowRegeneratePdf = $scope.task.status in ['demonstrate', 'ready_to_mark', 'discuss', 'complete'] and $scope.task.has_pdf

    # Keep track of team contributions for upload of group tasks
    $scope.team = {members: []}
    $scope.payload = { }

    $scope.mapTeamToPayload = ->
      total = groupService.groupContributionSum $scope.team.members
      _.map $scope.team.members, (member) -> { project_id: member.project_id, pct: (100 * member.rating / total).toFixed(0), pts: member.rating  }

    $scope.onBeforeUpload = ->
      if groupService.isGroupTask($scope.task)
        $scope.payload.contributions =  $scope.mapTeamToPayload()
      else
        $scope.payload.contributions = {}

      if $scope.uploadType == 'need_help'
        $scope.payload.trigger = 'need_help'

    $scope.setState = (newState) ->
      $scope.state = newState
  )
