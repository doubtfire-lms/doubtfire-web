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
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("LearningOutcomesStateCtrl", ($scope, $rootScope, $timeout, outcomeService, Unit, alertService, analyticsService, Visualisation) ->
  $scope.poaView = {
    activeTab: 'list'
  }
  $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor())
  $scope.currentProgress = outcomeService.calculateProgress($scope.unit, $scope.project)

  $scope.refreshCharts = Visualisation.refreshAll

  refreshAlignmentData = ->
    $scope.currentProgress.length = 0
    $scope.currentProgress = _.extend $scope.currentProgress, outcomeService.calculateProgress($scope.unit, $scope.project)

  $scope.$watch 'project', ->
    refreshAlignmentData()
    $rootScope.$broadcast('ProgressUpdated')

  $scope.$watch 'project.tasks', ->
    refreshAlignmentData()
    $rootScope.$broadcast('ProgressUpdated')

  $scope.selectTab = (tab) ->
    if tab is 'progress'
      if !$scope.classStats?
        Unit.learningProgressClassStats.get { id: $scope.unit.id },
          (response) -> $scope.classStats = response
          (response) ->
            if response.data.error?
              alertService.add("danger", "Error: " + response.data.error, 6000)
            else
              alertService.add("danger", "Failed to get unit progress class statistics", 6000)
            $scope.classStats = {}
    $scope.poaView.activeTab = tab
    eventName = if tab is 'progress' then "View Learning Progress Tab" else "Reflect on Learning Tab"
    analyticsService.event "Stuent Feedback View - Learning Outcomes Tab", "Switched Tab", eventName
    $scope.refreshCharts()

  # Default tab
  $scope.selectTab('progress')

  $scope.$on('UpdateAlignmentChart', ->
    refreshAlignmentData()
    $rootScope.$broadcast('ProgressUpdated')
  )
)
