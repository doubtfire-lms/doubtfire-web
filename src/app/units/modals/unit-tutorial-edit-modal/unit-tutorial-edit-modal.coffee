_ = require('underscore')

#
# Modal to edit or create a new tutorial
#
mod = angular.module('doubtfire.units.modals.unit-tutorial-edit-modal', [])

.factory('UnitTutorialEditModal', ($uibModal) ->
  UnitTutorialEditModal = {}

  #
  # Provide unit, and optionally a tutorial. If no tutorial is provided
  # it will assume you want to make a new tutorial
  #
  UnitTutorialEditModal.show = (unit, tutorial) ->
    $uibModal.open
      controller: 'UnitTutorialEditModalCtrl'
      template: require('./unit-tutorial-edit-modal.tpl.html')
      resolve: {
        tutorial: -> tutorial
        unit: -> unit
      }

  UnitTutorialEditModal
)
.controller('UnitTutorialEditModalCtrl', ($scope, $uibModalInstance, tutorial, unit, Tutorial, alertService) ->
  d = new Date()
  d.setHours(8)
  d.setMinutes(30)

  # Prototype tutorial
  prototypeTutorial =
    meeting_day: "Monday"
    meeting_time: d
    abbreviation: null
    meeting_location: null

  $scope.tutorial = tutorial or prototypeTutorial
  $scope.isNew = !tutorial?
  $scope.unit = unit

  $scope.tutors = $scope.unit.staff

  $scope.saveTutorial = ->
    save_data = _.omit($scope.tutorial, 'tutor', 'tutor_name', 'meeting_time', 'data')
    save_data.tutor_id = if $scope.tutorial.tutor.user_id then $scope.tutorial.tutor.user_id else $scope.tutorial.tutor.id

    if $scope.tutorial.meeting_time.getHours
      save_data.meeting_time = $scope.tutorial.meeting_time.getHours() + ":" + $scope.tutorial.meeting_time.getMinutes()

    if ! save_data.tutor_id?
      alertService.add 'danger', 'Ensure that you select a tutor from those engaged in this unit.', 6000
      return

    if $scope.isNew
      save_data.unit_id = unit.id
      Tutorial.create({ tutorial: save_data }).$promise.then (
        (response) ->
          $uibModalInstance.close(response)
          $scope.unit.tutorials.push(response)
          alertService.add("success", "Tutorial Added", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      Tutorial.update( { id: tutorial.id, tutorial: save_data } ).$promise.then (
        (response) ->
          $uibModalInstance.close(response)
          $scope.tutorial.tutor = response.tutor
          $scope.tutorial.tutor_name = response.tutor_name
          alertService.add("success", "Tutorial Updated", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
)

module.exports = mod.name
