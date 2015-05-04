angular.module('doubtfire.tasks.partials.submit-task-form', [])

#
# Task uploader form
#
.directive('submitTaskForm', ->
  restrict: 'E'
  scope:
    task: '='
    project: '='
  templateUrl: 'tasks/partials/templates/submit-task-form.tpl.html'
  controller: ($scope, TaskSubmission, Task, alertService, projectService, taskService) ->

    $scope.currentState = 'select-status'

    #
    # More option booleans
    #
    $scope.allowReupload = $scope.task.status == 'discuss' or $scope.task.status == 'fix_and_include' or $scope.task.status == 'complete'
    $scope.allowRegeneratePdf = ($scope.task.status == 'ready_to_mark' or $scope.task.status == 'discuss' or $scope.task.status == 'complete') and $scope.task.has_pdf

    $scope.recreateTask = () ->
      taskService.recreatePDF $scope.task, () -> $modalInstance.close()

    #
    # automatically recreate the FileUploader based on a change of Task
    #
    $scope.$watch 'task.id', ->
      $scope.uploadRequirements = $scope.task.task_upload_requirements
      $scope.fileUploader = TaskSubmission.fileUploader($scope, $scope.task)
      $scope.dismissMessage()

    #
    # upload functions
    #
    $scope.dismissMessage = ->
      $scope.uploadSucceeded = $scope.uploadFailed = false
      $scope.errorMessage = ''
    $scope.submitUpload = () ->
      $scope.fileUploader.uploadEnqueuedFiles()
      $scope.task.processing_pdf = true
    $scope.clearUploads = () ->
      $scope.fileUploader.clearQueue()
    $scope.fileUploadSuccess = () ->
      $scope.uploadSucceeded = true
    $scope.fileUploadFailed = (error) ->
      $scope.uploadFailed = true
      $scope.errorMessage = error
  )