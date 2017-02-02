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
  $scope.sortOrder = 'abbreviation'
  $scope.setTutorial = (id) ->
    Project.update(
      { id: $scope.project.project_id, tutorial_id: id }
      (project) ->
        $scope.project.tutorial_id = project.tutorial_id
        $scope.project.tutorial = $scope.unit.tutorialFromId( $scope.project.tutorial_id )
        eventName = if id isnt -1 then "Changed tutorial" else "Withdrew from all tutorials"
        analyticsService.event "Student Project View - Tutorials Tab", eventName
        projectService.updateGroups($scope.project) #can be removed from groups by changing labs
      (response) -> alertService.add("danger", response.data.error, 6000)
    )
)
