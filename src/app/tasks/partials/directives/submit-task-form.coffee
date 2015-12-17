angular.module('doubtfire.tasks.partials.submit-task-form', [])

#
# Task uploader form
#
.directive('submitTaskForm', ->
  restrict: 'E'
  scope:
    task: '='
    project: '='
    unit: '='
  templateUrl: 'tasks/partials/templates/submit-task-form.tpl.html'
  controller: ($scope, Task, taskService, alertService, projectService, groupService) ->
    # Upload types which are also task states
    UPLOAD_STATUS_TYPES = ['ready_to_mark', 'need_help']

    # Reverts changes to task state made during the upload
    revertChanges = (task) ->
      if task.definition.upload_requirements.length > 0 and $scope.uploadType? and $scope.uploadType in UPLOAD_STATUS_TYPES and $scope.oldStatus? and $scope.oldStatus isnt task.status
        # Revert it
        task.status = $scope.oldStatus if $scope.oldStatus?
        alertService.add("info", "No file(s) uploaded. Status reverted.", 4000)

    # Watch the task, and reinitialise oldStatus if it changes
    $scope.$watch 'task', (task, oldTask) ->
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

    # Watch the task's status and set it as the new upload type if it changes
    $scope.$watch 'task.status', (newStatus) ->
      return if newStatus is uploadType
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
        hide: false
      need_help:
        icon: taskService.statusIcons['need_help']
        text: taskService.statusLabels['need_help']
        class: 'need-help'
        hide: false
      reupload_evidence:
        icon: 'fa fa-recycle'
        text: "new evidence for portfolio"
        class: 'btn-info'
        # Upload evidence only okay in a final state
        hide: $scope.task.status not in ['discuss', 'fix_and_include', 'complete']

    # Switch the status if the upload type matches a state
    $scope.setUploadType = (type) ->
      if type in UPLOAD_STATUS_TYPES
        $scope.task.status = type
      $scope.uploadType = type

    # When upload is successful, update the task status on the back-end
    $scope.onSuccess = (response) ->
      $scope.task.status = response.status
      # Update the project's task stats and burndown data
      taskService.processTaskStatusChange $scope.unit, $scope.project, $scope.task, response.status, response

    $scope.onComplete = ->
      $scope.uploadType = null

    #
    # When the scope leaves focus, revert all changes if need be
    #
    $scope.$on '$destroy', ->
      revertChanges($scope.task)

    # Allow upload
    $scope.recreateTask = () ->
      # No callback
      taskService.recreatePDF $scope.task, null

    $scope.allowRegeneratePdf = $scope.task.status in ['ready_to_mark', 'discuss', 'complete'] and $scope.task.has_pdf

    # Keep track of team contributions for upload of group tasks
    $scope.team = {members: []}
    $scope.payload = { }

    $scope.mapTeamToPayload = () ->
      total = groupService.groupContributionSum $scope.team.members
      _.map $scope.team.members, (member) -> { project_id: member.project_id, pct: (100 * member.rating / total).toFixed(0)  }

    $scope.onBeforeUpload = () ->
      if groupService.isGroupTask($scope.task)
        $scope.payload.contributions =  $scope.mapTeamToPayload()
      else
        $scope.payload.contributions = {}

      if $scope.uploadType == 'need_help'
        $scope.payload.trigger = 'need_help'



    $scope.inGroupForTask = () ->
      projectService.getGroupForTask($scope.project, $scope.task)?

    $scope.isGroupTask = () ->
      groupService.isGroupTask($scope.task)
  )