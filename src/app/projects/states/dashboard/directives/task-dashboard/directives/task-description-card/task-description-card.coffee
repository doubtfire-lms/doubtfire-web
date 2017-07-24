angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-description-card', [])
#
# Description of task information
#
.directive('taskDescriptionCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.tpl.html'
  scope:
    taskDef: '='
    unit: '='
  controller: ($scope, Task, listenerService, analyticsService, gradeService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Required changes when task changes
    listeners.push $scope.$watch('taskDef.id', ->
      return unless $scope.taskDef?
      # Resource download URLs
      $scope.urls =
        taskSheet: Task.getTaskPDFUrl($scope.unit, $scope.taskDef)
        resources: Task.getTaskResourcesUrl($scope.unit, $scope.taskDef)
    )
    # Analytics event for when task resource is downloaded
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"
    # Expose grade names
    $scope.grades =
      names: gradeService.grades
      acronyms: gradeService.gradeAcronyms
)
