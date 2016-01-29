angular.module("doubtfire.units", [
  'doubtfire.units.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("units#show",
    url: "/units?unitRole"
    views:
      main:
        controller: "TutorUnitViewRootCtrl"
        templateUrl: "units/tutor-home.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"

    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
  .state("admin/units#index",
    url: "/admin/units"
    views:
      main:
        controller: "AdminUnitsCtrl"
        templateUrl: "units/admin-home.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  )
  .state("admin/units#edit",
    url: "/admin/units/:unitId"
    views:
      main:
        controller: "EditUnitCtrl"
        templateUrl: "units/admin-unit.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
   )
)

#
# The Tutor Unit View Controller is the root controller for the tutor
# unit contexts.
#
.controller("TutorUnitViewRootCtrl", ($scope, $state, $stateParams, UnitRole, Visualisation, alertService, unitService, analyticsService) ->
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

    if unitRole
      unitService.getUnit unitRole.unit_id, true, false, (unit)->
        $scope.unit = unit # the unit related to the role
        # Unit is only "loaded" if all the students were loaded
        $scope.$watch 'unit.students', (newValue) ->
          $scope.unitLoaded = true if _.isArray(newValue)
  # end get unit role

  # Unit Service allows access to typeahead data
  $scope.unitService = unitService

  $scope.closeAllStudents = () ->
    angular.forEach($scope.unit.students, (student) ->
      student.open = false
    )
)
.controller("AdminUnitsCtrl", ($scope, $state, $modal, Unit) ->
  $scope.units = Unit.query { include_in_active: true }

  $scope.showUnit = (unit) ->
    unitToShow = if unit?
      $state.transitionTo "admin/units#edit", {unitId: unit.id}

  $scope.createUnit = () ->
    $modal.open
      templateUrl: 'units/partials/templates/unit-create-modal.tpl.html'
      controller: 'AddUnitCtrl'
      resolve: {
        units: -> $scope.units
      }
)

.controller('EditUnitCtrl', ($scope, $state, $stateParams, Convenor, Tutor, UnitRole, unitService, headerService, alertService, analyticsService) ->
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

.controller('AddUnitCtrl', ($scope, $modalInstance, alertService, units, Unit) ->
  $scope.unit = new Unit { id: -1, active: true, code: "COS????", name: "Unit Name" }
  $scope.saveSuccess = (unit) ->
    alertService.add("success", "Unit created.", 2000)
    $modalInstance.close()
    units.push(unit)
)
