angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-description-card', [])
#
# Description of task information
#
.directive('taskDescriptionCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.tpl.html'
  scope:
    task: '='
    taskDef: '='
    unit: '='
  controller: ($scope, Task, listenerService, analyticsService, gradeService, alertService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Required changes when task changes
    listeners.push $scope.$watch('taskDef.id', ->
      return unless $scope.taskDef?
      # Resource download URLs
      $scope.urls =
        taskSheet: "#{Task.getTaskPDFUrl($scope.unit, $scope.taskDef)}&as_attachment=true"
        resources: Task.getTaskResourcesUrl($scope.unit, $scope.taskDef)
    )
    # Analytics event for when task resource is downloaded
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"
    # Expose grade names
    $scope.grades =
      names: gradeService.grades
      acronyms: gradeService.gradeAcronyms

    $scope.dueDate = () ->
      if $scope.task?
        return $scope.task.targetDate()
      else if $scope.taskDef?
        return $scope.taskDef?.target_date
      else
        return new Date()

    $scope.startDate = () ->
      if $scope.task?
        return $scope.task.startDate()
      else if $scope.taskDef?
        return $scope.taskDef.start_date
      else
        return new Date()

    $scope.shouldShowDeadline = () ->
      $scope.task?.daysUntilDueDate() <= 14 || false

    $scope.applyForExtension = () ->
      $scope.task.applyForExtension(
        (success) ->
          alertService.add("success", "Extension granted", 2000)
        (failure) ->
          alertService.add("danger", "Extension failed - #{failure.data.error}", 6000)
      )
)
