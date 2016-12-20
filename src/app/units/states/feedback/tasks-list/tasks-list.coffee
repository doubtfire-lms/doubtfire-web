angular.module('doubtfire.units.states.feedback.tasks-list', [])
#
# View a list of tasks
#
.directive('tasksList', ->
  restrict: 'E'
  templateUrl: 'units/states/feedback/tasks-list/tasks-list.tpl.html'
  scope:
    selectedTask: '='
    unit: '='
  controller: ($scope, Unit, taskService, alertService, currentUser) ->
    $scope.showSearchOpts = false
    # Search option filters ()
    $scope.filters = {
      studentName: null
      statuses: []
      statusesChecked: {}
      taskDefinition: null
      tutorialIdSelected: 'mine'
      tutorials: []
    }
    # Task status filter options
    _.each taskService.statusToDiscuss, (status) ->
      $scope.filters.statusesChecked[status] = true
      $scope.filters.statuses.push(status)
    $scope.taskStatuses = taskService.statusKeys
    # Tutorial options
    $scope.tutorialScopeOptions = $scope.unit.tutorials
    $scope.updateStatusCheck = (toggleStatus) ->
      if _.includes($scope.filters.statuses, toggleStatus)
        console.log("removing", toggleStatus)
        $scope.filters.statuses = _.without($scope.filters.statuses, toggleStatus)
      else
        console.log("adding", toggleStatus)
        $scope.filters.statuses.push(toggleStatus)
      console.log($scope.filters.statuses)
    $scope.$watch 'filters.tutorialIdSelected', (tutorialId) ->
      return unless _.isString(tutorialId)
      if tutorialId == 'mine'
        $scope.filters.tutorials = $scope.unit.tutorialsForUserId(currentUser.id)
      else if tutorialId == 'all'
        $scope.filters.tutorials = $scope.unit.tutorials
      else
        $scope.filters.tutorials = [$scope.unit.tutorialFromId(tutorialId)]
      $scope.filters.tutorials = _.map $scope.filters.tutorials, 'id'
      console.log("$scope.filters.tutorials", $scope.filters.tutorials)
    $scope.$watch 'filters.taskDefinition.id', (td) ->
      console.log("$scope.filters.taskDefinition", $scope.filters.taskDefinition)
    # Tasks for feedback
    $scope.$watch 'unit.id', (newUnitId) ->
      return unless newUnitId?
      Unit.tasksRequiringFeedback.query { id: newUnitId },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks response
        (response) ->
          alertService.add("danger", response.data.error, 6000)
)
