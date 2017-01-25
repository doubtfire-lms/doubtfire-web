# angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-status-card', [])
# #
# # Status of the card
# #
# .directive('taskStatusCard', ->
#   restrict: 'E'
#   templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.tpl.html'
#   scope:
#     task: '='
#     unitRole: '=?'
#   controller: ($scope, taskService, listenerService, gradeService) ->
#     # Cleanup
#     listeners = listenerService.listenTo($scope)
#     # Reapply triggers available
#     reapplyTriggers = ->
#       studentTriggers = _.map(taskService.switchableStates.student, taskService.statusData)
#       filteredStudentTriggers = $scope.task.filterFutureStates(studentTriggers)
#       $scope.triggers = filteredStudentTriggers
#       return unless $scope.unitRole?
#       tutorTriggers = _.map(taskService.switchableStates.tutor, taskService.statusData)
#       $scope.triggers.concat(tutorTriggers)
#     # Evaluate changes to submission data
#     reapplySubmissionData = ->
#       $scope.submission = {
#         isProcessing: !task.has_pdf && task.processing_pdf
#         isuploaded: task.has_pdf and not task.processing_pdf)
#       }

#     $scope.taskUrl = TaskFeedback.getTaskUrl newTask
#     $scope.taskFilesURL = TaskFeedback.getTaskFilesUrl newTask
# )
