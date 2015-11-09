angular.module("doubtfire.units", [
  'doubtfire.units.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("units#show",
    url: "/units?unitRole"
    views:
      main:
        controller: "TutorUnitViewRootCtrl"
        templateUrl: "units/show.tpl.html"
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
.controller("TutorUnitViewRootCtrl", ($scope, $state, UnitRole, alertService, unitService) ->
  $scope.unitLoaded = false

  # Fetch the user's Unit Role
  UnitRole.get { id: $state.params.unitRole }, (unitRole) ->
    $scope.unitRole = unitRole # the selected unit role

    if unitRole
      unitService.getUnit unitRole.unit_id, true, false, (unit)->
        $scope.unit = unit # the unit related to the role

        $scope.unitLoaded = true
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

.controller('EditUnitCtrl', ($scope, $state, $stateParams, unitService, headerService, alertService, Convenor, Tutor, UnitRole) ->
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

  unitService.getUnit $state.params.unitId, true, true, (unit) ->
    $scope.unit = unit
    $scope.currentStaff = $scope.unit.staff
    UnitRole.query (roles) ->
      $scope.unitRoles = _.filter(roles, (role) -> role.unit_id == unit.id)
      if $scope.unitRoles
        $scope.assessingUnitRole = $scope.unitRoles[0]
)

.controller('AddUnitCtrl', ($scope, $modalInstance, alertService, units, Unit) ->
  $scope.unit = new Unit { id: -1, active: true, code: "COS????", name: "Unit Name" }
  $scope.saveSuccess = (unit) ->
    alertService.add("success", "Unit created.", 2000)
    $modalInstance.close()
    units.push(unit)
)

