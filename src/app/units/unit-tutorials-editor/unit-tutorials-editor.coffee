_ = require('lodash')

#
# Editor for modifying the tutorials in a unit
#
mod = angular.module('doubtfire.units.unit-tutorials-editor', [])

.directive('unitTutorialsEditor', ->
  replace: true
  restrict: 'E'
  template: require('./unit-tutorials-editor.tpl.html')
  controller: ($scope, $uibModal, $rootScope, Unit, UnitRole, Tutorial, UnitTutorialEditModal, alertService) ->
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

module.exports = mod.name
