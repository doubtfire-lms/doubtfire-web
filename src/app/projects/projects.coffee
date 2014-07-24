angular.module("doubtfire.projects", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("projects#show",
    url: "/projects/:projectId?unitRole"
    views:
      main:
        controller: "ProjectsShowCtrl"
        templateUrl: "projects/projects-show.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"

    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
)
.controller("ProjectsShowCtrl", ($scope, $state, $stateParams, Project, Unit, UnitRole, headerService, alertService) ->
  $scope.unitLoaded = false
  $scope.studentProjectId = $stateParams.projectId
  $scope.projectLoaded = false

  Project.get { id: $scope.studentProjectId }, (project) ->
    
    # Clear any page-specific menus
    headerService.clearMenus()
    
    # Provide access to the Project's details
    $scope.project = project # the selected unit role

    # Set the roles in the header
    # links = []
    # if project
    #   links.push { class: "active", url: "#/projects/?unitRole=" + unitRole.id, name: unitRole.role }
      
    #   for other_role in unitRole.other_roles
    #     links.push { class: "", url: "#/units?unitRole=" + other_role.id, name: other_role.role }

    # headerService.setLinks( links )

    if project
      Unit.get { id: project.unit_id }, (unit) ->
        $scope.unit = unit # the unit related to the role
        $scope.unitLoaded = true

      if $stateParams.unitRole?
        UnitRole.get { id: $stateParams.unitRole }, (unitRole) ->
          if unitRole.unit_id == $scope.unit.id
            $scope.assessingUnitRole = unitRole
      
      $scope.burndownData = project.burndown_chart_data
      $scope.projectLoaded = true

  # end get project
)