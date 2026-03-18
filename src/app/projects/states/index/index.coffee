angular.module('doubtfire.projects.states.index', [])

#
# Root state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/index', {
    url: "/projects/:projectId"
    abstract: true
    views:
      main:
        controller: "ProjectsIndexStateCtrl"
        templateUrl: "units/states/index/index.tpl.html" # We can re-use unit's index here
    data:
      pageTitle: "_Home_"
  }
)

.controller("ProjectsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, newProjectService, listenerService, globalStateService) ->
  # Error - required projectId is missing!
  projectId = +$stateParams.projectId
  return $state.go('home') unless projectId

  globalStateService.onLoad () ->
    # Load in project
    newProjectService.get(projectId, {
      # Ensure that we cache queries here... so that we get any projects we are in
      # even when we are also teaching that unit
      cacheBehaviourOnGet: 'cacheQuery',
      mappingCompleteCallback: (project)->
        # Wait for the project mapping to complete - ensuring unit details are loaded
        $scope.unit = project.unit

    }).subscribe(
      {
        next: (project) ->
          # Broadcast change in project
          $scope.project = project
          $scope.unit = project.unit if project.unit.taskDefinitions.length > 0 && project.tasks.length == project.unit.taskDefinitions.length

          globalStateService.setView('PROJECT', $scope.project)

          # Go home if no project was found
          return $state.go('home') unless project?

        error: (failure) ->
          $state.go('home')
      }
    )
)
