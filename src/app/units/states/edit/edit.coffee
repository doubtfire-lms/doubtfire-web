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
.controller('EditUnitStateCtrl', ($scope, $state, $stateParams, Convenor, Tutor, UnitRole, unitService, headerService, alertService, analyticsService) ->
  analyticsService.event 'Edit Unit View', "Started Edit Unit View", 'Unit Tab'

  unitService.getUnit $state.params.unitId, true, true, (unit) ->
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
    $scope.activeTab?.active = false
    $scope.activeTab = tab
    $scope.activeTab.active = true
    # Actions to take when selecting this tab
    if $scope.assessingUnitRole?
      analyticsService.event "#{if $scope.newUnit then 'Edit' else 'Create'} Unit View", "Switched Tab as #{$scope.assessingUnitRole.role}", "#{tab.title} Tab"
    else # guess as haven't loaded role yet -- or admin role
      analyticsService.event "#{if $scope.newUnit then 'Edit' else 'Create'} Unit View", "Switched Tab as Administrator", "#{tab.title} Tab"

  $scope.activeTab = $scope.tabs.unitTab

  Convenor.query().$promise.then( (convenors) ->
    Tutor.query().$promise.then( (tutors) ->
      staff = _.union(convenors,tutors)
      staff = _.map(staff, (convenor) ->
        return { id: convenor.id, full_name: convenor.first_name + ' ' + convenor.last_name }
      )
      staff = _.uniq(staff, (item) ->
        return item.id
      )
      $scope.staff = staff
    )
  )
)
