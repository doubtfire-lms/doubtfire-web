# Source of truth for the outcomes feature.
# This state owns the route, page-level logic, and template rendering.
# Outcomes UI has been inlined into outcomes.tpl.html to remove duplicated
# logic previously shared with project-outcome-alignment.

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
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student', 'Auditor']
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
            alertService.error(response, 6000)
            $scope.classStats = {}
        })

    $scope.poaView.activeTab = tab
    $scope.refreshCharts()

  # Default tab
  $scope.selectTab('progress')

  $scope.$on('UpdateAlignmentChart', ->
    refreshAlignmentData()
    $rootScope.$broadcast('ProgressUpdated')
  )
)
