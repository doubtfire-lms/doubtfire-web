mod = angular.module('doubtfire.units.states.edit-unit-view', [])

#
# State for convenors to edit a particular unit
#
.config((headerServiceProvider) ->
  editUnitViewStateData =
    url: "/admin/units/:unitId"
    views:
      main:
        controller: "EditUnitViewCtrl"
        template: require('./edit-unit-view.tpl.html')
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']

  headerServiceProvider.state "admin/units#edit", editUnitViewStateData
)
.controller('EditUnitViewCtrl', ($scope, $state, $stateParams, Convenor, Tutor, UnitRole, unitService, headerService, alertService, analyticsService) ->
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
      title: "Unit"
      icon:  "fa-university"
      seq:   0
    learningOutcomesTab:
      title: "Learning Outcomes"
      icon:  "fa-graduation-cap"
      seq:   1
    staffTab:
      title: "Staff"
      icon:  "fa-male"
      seq:   2
    tutorialsTab:
      title: "Tutorials"
      icon:  "fa-pencil"
      seq:   3
    studentsTab:
      title: "Students"
      icon:  "fa-user"
      seq:   4
    tasksTab:
      title: "Tasks"
      icon:  "fa-tasks"
      seq:   5
    taskAlignmentTab:
      title: "Task Alignment"
      icon:  "fa-link"
      seq:   5
    groupsTab:
      title: "Groups"
      icon:  "fa-users"
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

module.exports = mod.name
