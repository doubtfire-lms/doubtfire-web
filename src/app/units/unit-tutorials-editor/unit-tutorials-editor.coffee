angular.module('doubtfire.units.unit-tutorials-editor', [])

.directive('tutorialUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutorial-admin-context.tpl.html'
  controller: ($scope, $modal, $rootScope, Unit, UnitRole, Tutorial, UnitTutorialEditModal, alertService) ->
    $scope.editTutorial = (tutorial) ->
      UnitTutorialEditModal.show $scope.unit, tutorial

    $scope.deleteTutorial = (tutorial) ->
      Tutorial.delete { id: tutorial.id },
        (response) ->
          $scope.unit.tutorials = _.without $scope.unit.tutorials, tutorial
          alertService.add("info", "Tutorial #{tutorial.abbreviation} was deleted successfully")
        (response) ->
          alertService.add("danger", response.data.error)

    $scope.createTutorial = ->
      UnitTutorialEditModal.show $scope.unit

)
