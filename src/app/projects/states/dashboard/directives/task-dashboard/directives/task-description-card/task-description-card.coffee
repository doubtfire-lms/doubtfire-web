angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-description-card', [])
#
# Description of task information
#
.directive('taskDescriptionCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, Task, listenerService, gradeService) ->
    # Resource download URLs
    $scope.urls =
      taskSheet: Task.getTaskPDFUrl($scope.task.unit(), $scope.task.definition)
      resources: Task.getTaskResourcesUrl($scope.task.unit(), $scope.task.definition)
    # Analytics event for when task resource is downloaded
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"
    # Expose grade names
    $scope.grades =
      names: gradeService.grades
      acronyms: gradeService.gradeAcronyms
)
