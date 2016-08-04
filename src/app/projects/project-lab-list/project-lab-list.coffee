mod = angular.module('doubtfire.projects.project-lab-list', [])

#
# Allows students to change which lab they are in
# for the specific project
#
.directive('projectLabList', ->
  restrict: 'E'
  template: require('./project-lab-list.tpl.html')
  controller: ($scope, $uibModal, User, Project, alertService, projectService, analyticsService) ->
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

module.exports = mod.name
