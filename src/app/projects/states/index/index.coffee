angular.module('doubtfire.projects.states.index', [])

#
# Root state for projects
#
.config((headerServiceProvider) ->
  headerServiceProvider.state 'projects/index', {
    url: "/projects/:projectId"
    abstract: true
    views:
      main:
        controller: "ProjectsIndexStateCtrl"
        templateUrl: "units/states/index/index.tpl.html" # We can re-use unit's index here
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  }
)

.controller("ProjectsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, UnitRole, unitService, projectService, listenerService) ->
  # Error - required projectId is missing!
  projectId = +$stateParams.projectId
  return $state.go('home') unless projectId

  # Load in project
  projectService.getProject(projectId, null,
    (project) ->
      # Go home if no project was found
      return $state.go('home') unless project?
      # Load unit for project
      unitService.getUnit(project.unit_id, (unit) ->
        $scope.unit = unit
        # Map the project to the unit
        $scope.project = $scope.unit.mapStudentToUnit(project)
        # Broadcast change in project
        $rootScope.$broadcast 'ProjectChanged', { context: $scope.project }
      )
    (failure) ->
      $state.go('home')
  )
)
