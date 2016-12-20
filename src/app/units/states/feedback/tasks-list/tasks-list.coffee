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
        $scope.filters.statuses = _.without($scope.filters.statuses, toggleStatus)
      else
        $scope.filters.statuses.push(toggleStatus)
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
      Unit.tasksRequiringFeedback.query { id: newUnitId },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks response
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # Selected task
    $scope.setSelectedTask = (task) ->
      $scope.selectedTask = task
    $scope.statusClass = taskService.statusClass
)
