mod = angular.module('doubtfire.units.states.teacher-view', [])

#
# View for teachers of a unit. They can see everything related
# to multiple students in the entire unit provided
#
.config((headerServiceProvider) ->
  teacherViewStateData =
    url: "/units?unitRole"
    views:
      main:
        controller: "TeacherViewCtrl"
        template: require('./teacher-view.tpl.html')
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'units#show', teacherViewStateData
)

.controller("TeacherViewCtrl", ($scope, $state, $stateParams, UnitRole, Visualisation, alertService, unitService, analyticsService) ->
  analyticsService.event 'Teacher View', "Started Tutor Unit View", 'Feedback Tab'

  $scope.unitLoaded = false
  refreshCharts = Visualisation.refreshAll

  #
  # Active tab group
  #
  $scope.tabs =
    feedbackTab:
      title: 'Feedback'
      icon:  'fa-check-square-o'
      seq:   0
    studentsTab:
      title: 'Students'
      icon:  'fa-user'
      seq:   1
    tasksTab:
      title: 'Tasks'
      icon:  'fa-tasks'
      seq:   2
    groupsTab:
      title: 'Groups'
      icon:  'fa-users'
      seq:   3
    plagiarismTab:
      title: 'Plagiarism'
      icon:  'fa-eye'
      seq:   4
    analyticsTab:
      title: 'Analytics'
      icon:  'fa-bar-chart'
      seq:   5
    gradingTab:
      title: 'Grading'
      icon:  'fa-book'
      seq:   6

  # Set the active tab
  $scope.setActiveTab = (tab) ->
    # Do nothing if we're switching to the same tab
    return if tab is $scope.activeTab
    # Actions to perform when changing tab
    $scope.activeTab?.active = false
    $scope.activeTab = tab
    $scope.activeTab.active = true
    # Actions to take when selecting this tab
    switch tab
      when $scope.tabs.analyticsTab
        refreshCharts()
    analyticsService.event 'Teacher View', "Switched Tab as #{$scope.unitRole.role}", "#{tab.title} Tab"

  # Kill tabs that aren't applicable
  cleanupTabs = ->
    # Set the active tab if it isn't yet set
    unless $scope.activeTab?
      $scope.activeTab = $scope.tabs.feedbackTab
    # Kill tabs on conditions (think ng-if to show tabs on conditions)
    unless $scope.unit.group_sets.length > 0
      delete $scope.tabs.groupsTab
    unless $scope.unit.students.length > 10
      delete $scope.tabs.analyticsTab

  $scope.assessingUnitRole = $stateParams.unitRole

  # Show the *right* tabs when unit is loaded
  $scope.$watch 'unitLoaded', (newValue) ->
    cleanupTabs() if newValue is true

  # Fetch the user's Unit Role
  UnitRole.get { id: $state.params.unitRole }, (unitRole) ->
    $scope.unitRole = unitRole # the selected unit role
    $scope.assessingUnitRole = unitRole

    if unitRole
      unitService.getUnit unitRole.unit_id, true, false, (unit)->
        $scope.unit = unit # the unit related to the role
        # Unit is only "loaded" if all the students were loaded
        $scope.$watch 'unit.students', (newValue) ->
          $scope.unitLoaded = true if _.isArray(newValue)
  # end get unit role

  # Unit Service allows access to typeahead data
  $scope.unitService = unitService
)

module.exports = mod.name
