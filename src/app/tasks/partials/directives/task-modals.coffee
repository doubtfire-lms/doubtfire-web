angular.module('doubtfire.tasks.partials.modals', [])

# #
# # task = the task to update
# # student = passed through from tutor view to allow update of task stats
# #
# .controller('AssessTaskModalCtrl', ($scope, $modalInstance, $modal, task, student, project, onChange, assessingUnitRole, Task, alertService, projectService, taskService) ->
#   $scope.task = task

#   $scope.$watch 'task.status', ->
#     $scope.taskClass = _.trim(_.dasherize($scope.task.status), '-')
#     $scope.taskStatusLabel = taskService.statusLabels[$scope.task.status]

#   #
#   # More option booleans
#   #
#   $scope.allowReupload = $scope.task.status == 'discuss' || $scope.task.status == 'fix_and_include' || $scope.task.status == 'complete'
#   $scope.allowRegeneratePdf = ($scope.task.status == 'ready_to_mark' || $scope.task.status == 'discuss' || $scope.task.status == 'complete') && $scope.task.has_pdf

#   #
#   # Allow user to upload new portfolio evidence
#   #
#   $scope.uploadFiles = () ->
#     oldStatus = $scope.task.status
#     $modalInstance.close(oldStatus) # close task modal to allow new submission modal
#     $modal.open(
#       controller: 'SubmitTaskModalCtrl'
#       templateUrl: 'tasks/partials/templates/submit-task-modal.tpl.html'
#       resolve: {
#         task: -> $scope.task,
#         student: -> student,
#         onChange: -> onChange
#       }
#     ).result.then(
#       (val) -> ,
#       # They cancelled the upload...
#       () ->
#         $scope.task.status = oldStatus
#         alertService.add("info", "Upload cancelled: status was reverted.", 2000)
#     )

#   $scope.recreateTask = () ->
#     taskService.recreatePDF $scope.task, () -> $modalInstance.close()

#   $scope.triggerTransition = (status) ->
#     oldStatus = $scope.task.status
#     # If we have a task with upload requirements and we're changing state to ready to mark
#     # then open the next modal and close this one...
#     if status == 'ready_to_mark' and $scope.task.upload_requirements.length > 0
#       $scope.uploadFiles()
#     else
#       Task.update({ id: $scope.task.id, trigger: status }).$promise.then (
#         # Success
#         (value) ->
#           $scope.task.status = value.status
#           $modalInstance.close(status)

#           if student? && student.task_stats?
#             projectService.updateTaskStats(student, value.new_stats)

#           if value.status == status
#             alertService.add("success", "Status saved.", 2000)
#             if onChange
#               onChange()
#           else
#             alertService.add("info", "Status change was not changed.", 4000)
#         ),
#         # Fail
#         (value) ->
#           $modalInstance.close(value.data.error)
#           $scope.task.status = oldStatus
#           alertService.add("danger", value.data.error, 6000)


#   $scope.readyToAssessStatuses = ['ready_to_mark', 'not_submitted']
#   $scope.engagementStatuses    = ['working_on_it', 'need_help']
#   $scope.orderedStatuses       = ['not_submitted', 'need_help', 'working_on_it', 'ready_to_mark']
#   $scope.tutorStatuses         = ['fix_and_include', 'redo', 'fix_and_resubmit', 'discuss' ]
#   $scope.completeStatuses      = ['complete']

#   if assessingUnitRole?
#     $scope.role = assessingUnitRole.role
#   else
#     $scope.role = "Student"

#   $scope.activeClass = (status) ->
#     if status == $scope.task.status
#       "active"
#     else
#       ""

#   $scope.taskEngagementConfig = {
#     readyToAssess: $scope.readyToAssessStatuses.map (status) ->
#       { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], helpText: taskService.helpText(status) }
#     engagement: $scope.engagementStatuses.map (status) ->
#       { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], helpText: taskService.helpText(status) }
#     all: $scope.orderedStatuses.map (status) ->
#       { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
#     tutorTriggers: $scope.tutorStatuses.map (status) ->
#       { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
#     complete: $scope.completeStatuses.map (status) ->
#       { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
#   }

#   # Whether or not to show help
#   $scope.showHelp = false
# )
# .controller('SubmitTaskModalCtrl', ($scope, $modalInstance, TaskSubmission, Task, task, student, onChange, alertService) ->
#   $scope.task = task
#   $scope.uploadRequirements = task.upload_requirements
#   $scope.fileUploader = TaskSubmission.fileUploader($scope, task, student, onChange)
#   $scope.submitUpload = () ->
#     $scope.fileUploader.uploadEnqueuedFiles()
#     task.processing_pdf = true
#   $scope.clearUploads = () ->
#     $scope.fileUploader.clearQueue()
#   $scope.close = () ->
#     $modalInstance.close()
# )