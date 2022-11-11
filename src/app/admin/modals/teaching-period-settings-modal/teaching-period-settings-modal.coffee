angular.module('doubtfire.admin.modals.teaching-period-settings-modal', [])

.factory('TeachingPeriodSettingsModal', ($modal) ->
  TeachingPeriodSettingsModal = {}

  TeachingPeriodSettingsModal.show = () ->
    $modal.open
      templateUrl: 'admin/modals/teaching-period-settings-modal/teaching-period-settings-modal.tpl.html'
      controller: 'TeachingPeriodSettingsModal'

  TeachingPeriodSettingsModal
)

.controller('TeachingPeriodSettingsModal', ($scope, $modalInstance, DoubtfireConstants, alertService, analyticsService, newTeachingPeriodService) ->
  $scope.teachingperiod = newTeachingPeriodService.buildInstance({})
  $scope.isNew = true

  $scope.calOptions = {
    startOpened: false
    endOpened: false
    activeUntilOpened: false
  }

  # Get the external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  $scope.modalState = {}

  # Datepicker opener
  $scope.open = ($event, pickerData) ->
    $event.preventDefault()
    $event.stopPropagation()

    if pickerData == 'start'
      $scope.calOptions.startOpened = ! $scope.calOptions.startOpened
      $scope.calOptions.endOpened = false
      $scope.calOptions.activeUntilOpened = false
    else if pickerData == 'end'
      $scope.calOptions.startOpened = false
      $scope.calOptions.endOpened = ! $scope.calOptions.endOpened
      $scope.calOptions.activeUntilOpened = false
    else
      $scope.calOptions.startOpened = false
      $scope.calOptions.endOpened = false
      $scope.calOptions.activeUntilOpened = ! $scope.calOptions.activeUntilOpened

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  }

  $scope.saveTeachingPeriod = ->
    newTeachingPeriodService.store( $scope.teachingperiod ).subscribe({
      next: (createdTeachingPeriod) ->
        $modalInstance.close(createdTeachingPeriod)
        alertService.add("success", "Teaching Period created.", 2000)
      error: (response) ->
        alertService.add("danger", "Error: " + response, 6000)
    })
)

