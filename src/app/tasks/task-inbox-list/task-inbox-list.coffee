angular.module('doubtfire.tasks.task-inbox-list', [])
#
# View a list of tasks in inbox
#
.directive('taskInboxList', ->
  restrict: 'E'
  templateUrl: 'tasks/task-inbox-list/task-inbox-list.tpl.html'
  scope:
    selectedTask: '='
    unit: '='
  controller: ($scope, Unit, taskService, alertService, currentUser) ->
    $scope.showSearchOpts = false
    # Search option filters ()
    $scope.filters = {
      studentName: null
      tutorialIdSelected: 'mine'
      tutorials: []
    }
    # Tutorial options
    $scope.tutorialScopeOptions = $scope.unit.tutorials
    $scope.$watch 'filters.tutorialIdSelected', (tutorialId) ->
      return unless _.isString(tutorialId)
      if tutorialId == 'mine'
        $scope.filters.tutorials = $scope.unit.tutorialsForUserId(currentUser.id)
      else if tutorialId == 'all'
        $scope.filters.tutorials = $scope.unit.tutorials
      else
        $scope.filters.tutorials = [$scope.unit.tutorialFromId(tutorialId)]
      $scope.filters.tutorials = _.map $scope.filters.tutorials, 'id'
    # Tasks for feedback
    $scope.$watch 'unit.id', (newUnitId) ->
      return unless newUnitId?
      Unit.tasksForTaskInbox.query { id: newUnitId },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks(response)
          # Was provided selected task id? Load it now
          if $scope.selectedTask?.id?
            task = _.find($scope.tasks, {id: $scope.selectedTask.id})
            $scope.setSelectedTask(task)
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # Selected task
    $scope.setSelectedTask = (task) ->
      $scope.selectedTask = task
    $scope.statusClass = taskService.statusClass
)
