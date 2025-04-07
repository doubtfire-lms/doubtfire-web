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
   }
)

.controller("ProjectsTutorialsStateCtrl", ($scope) ->
  if $scope.unit.tutorialStreamsCache.size > 0
    $scope.sortOrder = 'tutorialStream.name'
  else
    $scope.sortOrder = 'abbreviation'
)
