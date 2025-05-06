angular.module('doubtfire.projects.states.outcomes', [])

#
# ILO outcomes visualisations
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/outcomes', {
    parent: 'projects/index'
    url: '/outcomes'
    controller: 'LearningOutcomesStateCtrl'
    templateUrl: 'projects/states/outcomes/outcomes.tpl.html'
    data:
      task: "Learning Outcomes"
      pageTitle: "_Home_"
   }
)

.controller("LearningOutcomesStateCtrl", ($scope, $rootScope, $timeout, alertService, outcomeService, newUnitService, Visualisation) ->
  $scope.poaView = {
    activeTab: 'list'
  }
  $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit, $scope.unit.taskStatusFactor)
  $scope.currentProgress = outcomeService.calculateProgress($scope.unit, $scope.project)

  $scope.refreshCharts = Visualisation.refreshAll

  refreshAlignmentData = ->
    $scope.currentProgress.length = 0
    $scope.currentProgress = _.extend $scope.currentProgress, outcomeService.calculateProgress($scope.unit, $scope.project)

  $scope.selectTab = (tab) ->
    if tab is 'progress'
      if !$scope.classStats?
        newUnitService.loadLearningProgressClassStats($scope.unit).subscribe({
          next: (response) -> $scope.classStats = response
          error: (response) ->
            alertService.error( response, 6000)
            $scope.classStats = {}
        })
    $scope.poaView.activeTab = tab
    eventName = if tab is 'progress' then "View Learning Progress Tab" else "Reflect on Learning Tab"
    $scope.refreshCharts()

  # Default tab
  $scope.selectTab('progress')

  $scope.$on('UpdateAlignmentChart', ->
    refreshAlignmentData()
    $rootScope.$broadcast('ProgressUpdated')
  )
)
