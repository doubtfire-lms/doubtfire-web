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

.controller("ProjectsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, newProjectService, listenerService, GlobalStateService) ->
  # Error - required projectId is missing!
  projectId = +$stateParams.projectId
  return $state.go('home') unless projectId

  GlobalStateService.onLoad () ->
    # Load in project
    newProjectService.get(projectId, {
      mappingCompleteCallback: (project)->
        # Wait for the project mapping to complete - ensuring unit details are loaded
        $scope.project = project
        $scope.unit = project.unit

        # Broadcast change in project
        GlobalStateService.setView('PROJECT', $scope.project)
    }).subscribe(
      {
        next: (project) ->
          # Go home if no project was found
          return $state.go('home') unless project?

        error: (failure) ->
          $state.go('home')
      }
    )
)
