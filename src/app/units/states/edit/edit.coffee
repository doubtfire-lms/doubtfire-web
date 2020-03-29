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
      roleWhitelist: ['Convenor', 'Admin']
   }
)
.controller('EditUnitStateCtrl', ($scope, $state, $stateParams, Convenor, Tutor, UnitRole, unitService, alertService, analyticsService) ->
  analyticsService.event 'Edit Unit View', "Started Edit Unit View", 'Unit Tab'

  unitService.getUnit $state.params.unitId, {loadAllStudents: true}, (unit) ->
    $scope.unit = unit
    $scope.newUnit = $scope.unit.id == -1
    $scope.currentStaff = $scope.unit.staff
    UnitRole.query (roles) ->
      $scope.unitRoles = _.filter(roles, (role) -> role.unit_id == unit.id)
      if $scope.unitRoles
        $scope.assessingUnitRole = $scope.unitRoles[0]

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

    # Actions to take when selecting this tab
    if $scope.assessingUnitRole?
      analyticsService.event "#{if $scope.newUnit then 'Edit' else 'Create'} Unit View", "Switched Tab as #{$scope.assessingUnitRole.role}", "#{tab.title} Tab"
    else # guess as haven't loaded role yet -- or admin role
      analyticsService.event "#{if $scope.newUnit then 'Edit' else 'Create'} Unit View", "Switched Tab as Administrator", "#{tab.title} Tab"

  $scope.activeTab = $scope.tabs.unitTab

  Tutor.query(
    (tutors) ->
      $scope.staff = _.map(tutors, (tutor) ->
        return { id: tutor.id, full_name: tutor.first_name + ' ' + tutor.last_name }
      )
  )
)
