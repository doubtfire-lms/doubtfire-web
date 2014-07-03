
angular.module("doubtfire.units", [
  'doubtfire.units.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("units#show",
    url: "/units?unitRole"
    views:
      main:
        controller: "UnitsShowCtrl"
        templateUrl: "units/show.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"

    data:
      pageTitle: "_Home_"
      roleWhitelist: ['basic', 'admin']
  )
  .state("admin/units#index",
    url: "/admin/units"
    views:
      main:
        controller: "AdminUnitsCtrl"
        templateUrl: "units/admin.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['admin']
  )
)
.controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit, UnitRole, headerService, alertService) ->
  $scope.unitLoaded = false


  UnitRole.get { id: $state.params.unitRole }, (unitRole) ->
    # The user selects the unit role to view - allows multiple roles per unit
    $scope.unitRole = unitRole # the selected unit role

    # Header menus
    menus = [ ]
    
    # Set menu header for links
    if unitRole
      rolesMenu = { name: 'Roles', links: [ ], icon: 'globe' }
      rolesMenu.links.push { class: "active", url: "#/units?unitRole=" + unitRole.id, name: unitRole.role }
      
      for other_role in unitRole.other_roles
        rolesMenu.links.push { class: "", url: "#/units?unitRole=" + other_role.id, name: other_role.role }

      menus.push( rolesMenu )
      
    # Push the roles menu to the header
    headerService.setMenus( menus )

    if unitRole
      Unit.get { id: unitRole.unit_id }, (unit) ->
        $scope.unit = unit # the unit related to the role
        $scope.unitLoaded = true
  # end get unit role

    
  #
  # Allow the caller to fetch a task definition from the unit based on its id
  #
  $scope.taskDef = (taskDefId) ->
    _.where $scope.unit.task_definitions, {id: taskDefId}

  #
  # Allow the caller to fetch a tutorial from the unit based on its id
  #
  $scope.tutorialFromId = (tuteId) ->
    _.where $scope.unit.tutorials, { id: tuteId }

  $scope.taskCount = () ->
    $scope.unit.task_definitions.length
)
.controller("AdminUnitsCtrl", ($scope, $state, $stateParams, $modal, Unit, Convenor) ->
  $scope.units = Unit.query()
  $scope.convenors = Convenor.query()

  $scope.showUnitModal = (unit) ->
    unitToShow = if unit?
      unit
    else
      new Unit { convenors: [] }

    $modal.open
      templateUrl: 'units/partials/templates/unit-modal.tpl.html'
      controller: 'UnitModalCtrl'
      resolve:
        unit: -> unitToShow
        convenors: -> $scope.convenors
)
