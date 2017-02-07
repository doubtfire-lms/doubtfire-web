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
        oldTutorialAbbr = $scope.unit.tutorialFromId($scope.project.tutorial_id)?.abbreviation
        $scope.project.tutorial_id = project.tutorial_id
        $scope.project.tutorial = $scope.unit.tutorialFromId( $scope.project.tutorial_id )
        if id == -1
          eventName = "Withdrew from all tutorials"
          successMsg = "Withdrew from #{oldTutorialAbbr}"
        else
          eventName = "Changed tutorial"
          successMsg = "Enrolled in #{$scope.project.tutorial.abbreviation}"
        analyticsService.event("Student Project View - Tutorials Tab", eventName)
        alertService.add("success", successMsg, 3000)
        projectService.updateGroups($scope.project) #can be removed from groups by changing labs
      (response) -> alertService.add("danger", response.data.error, 6000)
    )
)
