angular.module('doubtfire.tasks.partials.modals', [])

#
# task = the task to update
# student = passed through from tutor view to allow update of task stats
#
.controller('AssessTaskModalCtrl', ($scope, $modalInstance, $modal, task, student, project, onChange, assessingUnitRole, Task, alertService) ->
  # statusLabels global
  # statusLabels = {
  #   'ready_to_mark':      'Ready to Mark',
  #   'not_submitted':      'Not Started',
  #   'working_on_it':      'Working On It',
  #   'need_help':          'Need Help',
  #   'redo':               'Redo',
  #   'fix_and_include':    'Fix and Include',
  #   'fix_and_resubmit':   'Resubmit',
  #   'discuss':            'Discuss',
  #   'complete':           'Complete'
  # }

  # statusIcons = {
  #   'ready_to_mark':      'fa fa-thumbs-o-up',
  #   'not_submitted':      'fa fa-times',
  #   'working_on_it':      'fa fa-bolt',
  #   'need_help':          'fa fa-question-circle',
  #   'redo':               'fa fa-refresh',
  #   'fix_and_include':    'fa fa-stop',
  #   'fix_and_resubmit':   'fa fa-wrench',
  #   'discuss':            'fa fa-comment',
  #   'complete':           'fa fa-check-circle-o'
  # }

  $scope.task = task
  # $scope.task.status = 'not_ready_to_mark'

  $scope.$watch 'task.status', ->
    $scope.taskClass = _.trim(_.dasherize($scope.task.status), '-')
    $scope.taskStatusLabel = statusLabels[$scope.task.status]

  $scope.triggerTransition = (status) ->
    oldStatus = $scope.task.status
    # If we have a task with upload requirements and we're changing state to ready to mark
    # then open the next modal and close this one...
    if status == 'ready_to_mark' and $scope.task.task_upload_requirements.length > 0
      $modalInstance.close(oldStatus)
      $modal.open(
        controller: 'SubmitTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/submit-task-modal.tpl.html'
        resolve: {
          task: -> $scope.task,
          student: -> student,
          onChange: -> onChange
        }
      ).result.then(
        (val) -> ,
        # They cancelled the upload...
        () ->
          $scope.task.status = oldStatus
          alertService.add("info", "Upload cancelled: status was reverted.", 2000)
      )
    else
      Task.update({ id: $scope.task.id, trigger: status }).$promise.then (
        # Success
        (value) ->
          $scope.task.status = value.status
          $modalInstance.close(status)
  
          if student? && student.task_stats?
            update_task_stats(student.task_stats, value.new_stats)
          
          if value.status == status
            alertService.add("success", "Status saved.", 2000)
            if onChange
              onChange()
          else
            alertService.add("info", "Status change was not changed.", 4000)
        ),
        # Fail
        (value) ->
          $modalInstance.close(value.data.error)
          $scope.task.status = oldStatus
          alertService.add("danger", value.data.error, 6000)


  $scope.readyToAssessStatuses = ['ready_to_mark', 'not_submitted']
  $scope.engagementStatuses    = ['working_on_it', 'need_help']
  $scope.orderedStatuses       = ['not_submitted', 'need_help', 'working_on_it', 'ready_to_mark']
  $scope.tutorStatuses         = ['fix_and_include', 'redo', 'fix_and_resubmit', 'discuss' ]
  $scope.completeStatuses      = ['complete']

  if assessingUnitRole?
    $scope.role = assessingUnitRole.role
  else
    $scope.role = "Student"

  $scope.activeClass = (status) ->
    if status == $scope.task.status
      "active"
    else
      ""

  $scope.taskEngagementConfig = {
    readyToAssess: $scope.readyToAssessStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status] }
    engagement: $scope.engagementStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status] }
    all: $scope.orderedStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status], taskClass: _.trim(_.dasherize(status), '-') }
    tutorTriggers: $scope.tutorStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status], taskClass: _.trim(_.dasherize(status), '-') }
    complete: $scope.completeStatuses.map (status) ->
      { status: status, label: statusLabels[status], iconClass: statusIcons[status], taskClass: _.trim(_.dasherize(status), '-') }
  }
)
.controller('SubmitTaskModalCtrl', ($scope, $modalInstance, TaskSubmission, Task, task, student, onChange, alertService) ->
  $scope.task = task
  $scope.uploadRequirements = task.task_upload_requirements
  $scope.fileUploader = TaskSubmission.fileUploader($scope, task, student, onChange)
  $scope.submitUpload = () ->
    $scope.fileUploader.uploadEnqueuedFiles()
  $scope.clearUploads = () ->
    $scope.fileUploader.clearQueue()
  $scope.close = () ->
    $modalInstance.close()
)





