angular.module('doubtfire.units.states.analytics', [
  'doubtfire.units.states.analytics.directives'
])
#
# State for unit analytics
#
.config(($stateProvider) ->
  $stateProvider.state 'units/analytics', {
    parent: 'units/index'
    url: '/analytics'
    templateUrl: "units/states/analytics/analytics.tpl.html"
    controller: "UnitAnalyticsStateCtrl"
    data:
      task: "Unit Analytics"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitAnalyticsStateCtrl", ($scope) ->
  # TODO: (@alexcu) Refactor directives into sub states

  #
  # Active task tab group
  #
  $scope.tabs =
    csvStatDownload:
      title: "Unit Statistics"
      subtitle: "Download details related to student progress within the unit."
      seq: 0
    taskStatusStats:
      title: "Task Status Statistics"
      subtitle: "View distribution of tasks by their current status either unit-wide or broken down into a specific tutorial or task"
      seq: 1
    taskCompletionStats:
      title: "Task Completion Statistics"
      subtitle: "View how tasks have been marked as completed as a box plot"
      seq: 2
    targetGradeStats:
      title: "Target Grade Statistics"
      subtitle: "View distribution of student target grades either unit-wide or broken down into a specific tutorial"
      seq: 3
    achievementStats:
      title: "ILO Achievement Statistics"
      subtitle: "View how ILOs have been achieved by students to their associated tasks as a box plot"
      seq: 4

  #
  # Sets the active tab
  #
  $scope.setActiveTab = (tab) ->
    # Do nothing if we're switching to the same tab
    return if tab is $scope.activeTab
    $scope.activeTab?.active = false
    $scope.activeTab = tab
    $scope.activeTab.active = true

  $scope.setActiveTab($scope.tabs.csvStatDownload)

  #
  # Checks if tab is the active tab
  #
  $scope.isActiveTab = (tab) ->
    tab is $scope.activeTab
)
