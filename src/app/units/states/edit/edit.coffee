angular.module('doubtfire.units.states.edit', [
  'doubtfire.units.states.edit.directives'
])

#
# State for convenors to edit a particular unit
#
.config(($stateProvider) ->
  $stateProvider.state 'units/admin', {
    parent: 'units/index'
    url: '/admin'
    controller: 'EditUnitStateCtrl'
    templateUrl: 'units/states/edit/edit.tpl.html'
    data:
      task: 'Unit Administration'
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Convenor', 'Admin', 'Auditor']
   }
)
.controller('EditUnitStateCtrl', ($scope, $state, $stateParams, alertService, analyticsService, newUnitService, newUserService, globalStateService) ->
  globalStateService.onLoad () ->
    $scope.currentStaff = $scope.unit.staff

    $scope.assessingUnitRole = globalStateService.loadedUnitRoles.currentValues.find((role) -> role.unit == $scope.unit)

    newUserService.getTutors().subscribe( (tutors) -> $scope.staff = tutors )

  #
  # Active tab group
  #
  $scope.tabs =
    unitTab:
      title: "Unit Details"
      seq:   0
    learningOutcomesTab:
      title: "Learning Outcomes"
      seq:   1
    staffTab:
      title: "Staff"
      seq:   2
    tutorialsTab:
      title: "Tutorials"
      seq:   3
    studentsTab:
      title: "Students"
      seq:   4
    tasksTab:
      title: "Tasks"
      seq:   5
    taskAlignmentTab:
      title: "Task Alignment"
      seq:   5
    groupsTab:
      title: "Groups"
      seq:   6

  # Set the active tab
  $scope.setActiveTab = (tab) ->
    # Do nothing if we're switching to the same tab
    return if tab is $scope.activeTab

    # Actions to perform when changing tab
    $scope.activeTab?.active = false  # Deactivate original tab

    # run de-select actions...
    $scope.activeTab.deselect?()

    $scope.activeTab = tab            # Switch tabs
    $scope.activeTab.active = true    # Make it active

  $scope.activeTab = $scope.tabs.unitTab
)
