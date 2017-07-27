angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard', [
  'doubtfire.projects.states.dashboard.directives.task-dashboard.directives'
])
#
# Dashboard of task-related info
#
.directive('taskDashboard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/task-dashboard.tpl.html'
  scope:
    task: '='
  controller: ($scope, Task, TaskFeedback, listenerService) ->
    # the ways in which the dashboard can be viewed
    $scope.dashboardViews = ["details", "submission", "task"]
    # set the current dashboard view to details by default
    $scope.currentView = $scope.dashboardViews[0]
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      # get the url for the task sheet and the submissions
      $scope.urls = {
        taskSheetPdfUrl: Task.getTaskPDFUrl($scope.task.unit(), $scope.task.definition)
        taskSubmissionPdfUrl: TaskFeedback.getTaskUrl($scope.task)
      }
      $scope.currentView = $scope.dashboardViews[0]
    )
    
    # Set the selected dashboard view
    $scope.setSelectedDashboardView = (view) ->
      if view in $scope.dashboardViews
        $scope.currentView = view
    # Is the current view?
    $scope.isCurrentView = (view) ->
      return $scope.currentView == view
)
