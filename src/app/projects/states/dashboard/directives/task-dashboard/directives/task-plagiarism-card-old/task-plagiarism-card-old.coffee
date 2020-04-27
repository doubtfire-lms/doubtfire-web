angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-plagiarism-card', [])
#
# plagiarism of task information
#
.directive('taskPlagiarismCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-plagiarism-card/task-plagiarism-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, PlagiarismReportModal) ->
    $scope.viewReport = -> PlagiarismReportModal.show($scope.task)
)
