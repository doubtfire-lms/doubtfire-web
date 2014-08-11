
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
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
  .state("admin/units#index",
    url: "/admin/units"
    views:
      main:
        controller: "AdminUnitsCtrl"
        templateUrl: "units/admin.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  )
  .state("admin/units#edit",
    url: "/admin/units/:unitId"
    views:
      main:
        controller: "EditUnitCtrl"
        templateUrl: "units/unit.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
   )
)
.controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit, UnitRole, headerService, alertService) ->
  $scope.unitLoaded = false

  #
  # Unit Role header menu
  #
  UnitRole.get { id: $state.params.unitRole }, (unitRole) ->
    # The user selects the unit role to view - allows multiple roles per unit
    $scope.unitRole = unitRole # the selected unit role
    headerService.clearMenus()
    
    # Set menu header for links
    if unitRole
      # Only add 'Roles' menu if there are > 1 roles for the unit
      if unitRole.other_roles.length > 0
        rolesMenu = { name: "#{unitRole.role} View", links: [ ], icon: 'globe' }
        rolesMenu.links.push { class: "active", url: "#/units?unitRole=" + unitRole.id, name: unitRole.role }
        
        for other_role in unitRole.other_roles
          rolesMenu.links.push { class: "", url: "#/units?unitRole=" + other_role.id, name: other_role.role }
        
        # Push the roles menu to the header (remove old roles)
        headerService.setMenus( [rolesMenu] )

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
.controller("AdminUnitsCtrl", ($scope, $state, $modal, Unit) ->
  $scope.units = Unit.query {  }

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

.controller('EditUnitCtrl', ($scope, $state, $stateParams, Unit, UnitRole,  headerService, alertService, Convenor, Tutor, Students) ->
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

  Unit.get  { id: $state.params.unitId }, (unit) ->
    $scope.unit = unit
    $scope.currentStaff = $scope.unit.staff
    $scope.tutorialFromId = (tuteId) ->
      _.where($scope.unit.tutorials, { id: tuteId })
        
    Students.query { unit_id: $scope.unit.id, all: true }, (students) ->
      $scope.unit.students = students.map (student) ->
        tute = $scope.tutorialFromId( student.tute )
        if tute[0]
          student.tutorial = tute[0].abbreviation
        else
          student.tutorial = ""
        student.first_name = student.name.split(' ')[0]
        student.last_name = student.name.split(' ').pop()
        student.email = student.student_email
        student.username = student.student_id
        student
)

.controller('AddUnitCtrl', ($scope, $modalInstance, alertService, units, Unit) ->
  $scope.unit = new Unit { id: -1, active: true, code: "COS????" }
  $scope.saveSuccess = (unit) ->
    alertService.add("success", "Unit created.", 2000)
    $modalInstance.close()
    units.push(unit)
)

