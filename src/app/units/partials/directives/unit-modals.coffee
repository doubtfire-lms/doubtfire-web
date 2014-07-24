angular.module('doubtfire.units.partials.modals', [])
.controller('TutorialModalCtrl', ($scope, $modalInstance,  tutorial, isNew, unitService, Tutor) ->
  $scope.tutorial = tutorial
  $scope.isNew = isNew
  $scope.tutors = Tutor.query()

  $scope.saveTutorial = ->
)
.controller('UnitModalCtrl', ($scope, $modalInstance, Unit, convenors, unit) ->
  $scope.unit = unit
  $scope.modalState = {}
  $scope.availableConvenors = angular.copy(convenors)

  $scope.addSelectedConvenor = ->
    # Rip out the convenor to add and clear the input
    convenor = $scope.modalState.selectedConvenor
    $scope.modalState.selectedConvenor = null

    # Add the convenor to the list and remove it
    # from the list of available convenors
    $scope.unit.convenors.push(convenor)
    $scope.availableConvenors = _.without $scope.availableConvenors, convenor

  $scope.removeConvenor = (convenor) ->
    $scope.unit.convenors = _.without $scope.unit.convenors, convenor
    $scope.availableConvenors.push(convenor)

  $scope.saveUnit = ->
    Unit.create { unit: $scope.unit }
)
.controller('EnrolStudentModalCtrl', ($scope, $modalInstance, Project, unit, projects) ->
  $scope.unit = unit

  $scope.enrolStudent = (student_id, tutorial) ->
    # get tutorial_id from tutorial_name
    Project.create {unit_id: unit.id, student_num: student_id, tutorial_id: if tutorial then tutorial.id else null }, (project) ->
      projects.push project
      $modalInstance.close()
      #TODO: success and error alerts
)
