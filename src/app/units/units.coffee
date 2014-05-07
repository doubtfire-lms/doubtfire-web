angular.module("doubtfire.units", [
  'doubtfire.units.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("units#show",
    url: "/units/:id?unitRole"
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
.controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit, UnitRole, headerService) ->
  UnitRole.get { id: $state.params.id }, (unitRole) ->
    # The user selects the unit role to view - allows multiple roles per unit
    $scope.unitRole = unitRole # the selected unit role
    $scope.unit = $scope.unitRole.unit # the unit related to the role

    # Set the roles in the header
    links = []
    if unitRole
      links.push { class: "active", url: "#/units/" + unitRole.id, name: unitRole.role.name }
      
      for other_role in unitRole.other_roles
        links.push { class: "", url: "#/units/" + other_role.id, name: other_role.role }

    headerService.setLinks( links )
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
