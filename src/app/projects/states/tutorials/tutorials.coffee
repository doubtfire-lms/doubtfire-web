angular.module('doubtfire.projects.states.tutorials', [])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/tutorials', {
    parent: 'projects/index'
    url: '/tutorials'
    controller: 'ProjectsTutorialsStateCtrl'
    templateUrl: 'projects/states/tutorials/tutorials.tpl.html'
    data:
      task: "Tutorial List"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("ProjectsTutorialsStateCtrl", ($scope, $modal, User, Project, alertService, projectService, analyticsService) ->
  if $scope.unit.tutorial_streams.length > 0
    $scope.sortOrder = 'tutorial_stream.name'
  else
    $scope.sortOrder = 'abbreviation'
)
