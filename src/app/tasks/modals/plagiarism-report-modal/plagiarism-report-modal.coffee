angular.module('doubtfire.tasks.modals.plagiarism-report-modal', [])

#
# A modal to view the plagiarism report
#
.factory('PlagiarismReportModal', ($modal, alertService) ->
  PlagiarismReportModal = {}

  #
  # Open a grade task modal with the provided task
  #
  PlagiarismReportModal.show = (task) ->
    $modal.open
      templateUrl: 'tasks/modals/plagiarism-report-modal/plagiarism-report-modal.tpl.html'
      controller: 'PlagiarismReportModalCtrl'
      size: 'lg'
      resolve:
        task: -> task

  PlagiarismReportModal
)

.controller('PlagiarismReportModalCtrl', ($scope, task) ->
  $scope.task = task
)
