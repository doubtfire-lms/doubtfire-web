angular.module('doubtfire.projects.states.unitrequest', [])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/unitrequest', {
    parent: 'projects/index'
    url: '/unitrequest'
    controller: 'ProjectsUnitRequestStateCtrl'
    templateUrl: 'projects/states/unitrequest/unitrequest.tpl.html'
    data:
      task: "Request Unit"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("ProjectsUnitRequestStateCtrl", ($scope, $modal, User, Project,UnitRequest,alertService, projectService, analyticsService,Unit,unitService,currentUser) ->
  # Map unit role
  unitService.getUnitRoles (unitRoles) ->
    Unit.query({ include_in_active: true },
      (success) ->
        $scope.units = _.map(success, (unit) ->
          unit.unitRole = _.find(unitRoles, { unit_id: unit.id })
          unit
        )
      (failure) ->
        $scope.error = true
    )

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  $scope.addUnitRequest = (id) ->
    UnitRequest.create {unit_id: id, user_id: currentUser.id},
      (unitrequest) ->
        if unitrequest.id > 0
          alertService.add("success", "Student enrollement request recorded", 6000)
        else
          alertService.add("danger", "Erroe in adding enrollement request" , 6000)

      , (response) ->
        alertService.add("danger", response, 6000)
)