angular.module('doubtfire.units.partials.modals', [])
.controller('TutorialModalCtrl', ($scope, $modalInstance,  tutorial, isNew, unitService, Tutor) ->
  $scope.tutorial = tutorial
  $scope.isNew = isNew
  $scope.tutors = Tutor.query()

  $scope.saveTutorial = ->

  
)
