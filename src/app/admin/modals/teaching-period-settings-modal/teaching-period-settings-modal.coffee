angular.module('doubtfire.admin.modals.teaching-period-settings-modal', [])

.factory('TeachingPeriodSettingsModal', ($modal) ->
  TeachingPeriodSettingsModal = {}

  TeachingPeriodSettingsModal.show = (teachingPeriod) ->
    $modal.open
      templateUrl: 'admin/modals/teaching-period-settings-modal/teaching-period-settings-modal.tpl.html'
      controller: 'TeachingPeriodSettingsModal'
      resolve:
        teachingperiod: -> teachingPeriod

  TeachingPeriodSettingsModal
)

.controller('TeachingPeriodSettingsModal', ($scope, $modalInstance, ExternalName, alertService, analyticsService, currentUser, TeachingPeriod, teachingperiod, auth) ->
  $scope.teachingperiod = teachingperiod or { }
  $scope.isNew = teachingperiod?.id is undefined

  $scope.calOptions = {
    startOpened: false
    endOpened: false
  }

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = ExternalName

  if $scope.isNew
    $scope.teachingperiods = TeachingPeriod.query()

  $scope.currentUser = currentUser

  $scope.modalState = {}

  # Datepicker opener
  $scope.open = ($event, pickerData) ->
    $event.preventDefault()
    $event.stopPropagation()

    if pickerData == 'start'
      $scope.calOptions.startOpened = ! $scope.calOptions.startOpened
      $scope.calOptions.endOpened = false
    else
      $scope.calOptions.startOpened = false
      $scope.calOptions.endOpened = ! $scope.calOptions.endOpened

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  }

  createNewTeachingPeriod = ->
    TeachingPeriod.create( { teaching_period: $scope.teachingperiod } ).$promise.then (
      (response) ->
        $modalInstance.close(response)
        if $scope.teachingperiods
          $scope.teachingperiods.loadedPeriods.push(response)
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )
  
  updateExistingTeachingPeriod = ->
    TeachingPeriod.update( { id: $scope.teachingperiod.id, teaching_period: $scope.teachingperiod } ).$promise.then (
      (response) ->
        $modalInstance.close(response)
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )

  $scope.saveTeachingPeriod = ->
    if $scope.teachingperiod.start_date && $scope.teachingperiod.start_date.getMonth
      $scope.teachingperiod.start_date = "#{$scope.teachingperiod.start_date.getFullYear()}-#{$scope.teachingperiod.start_date.getMonth() + 1}-#{$scope.teachingperiod.start_date.getDate()}"
    if $scope.teachingperiod.end_date && $scope.teachingperiod.end_date.getMonth
      $scope.teachingperiod.end_date = "#{$scope.teachingperiod.end_date.getFullYear()}-#{$scope.teachingperiod.end_date.getMonth() + 1}-#{$scope.teachingperiod.end_date.getDate()}"

    if $scope.isNew
      createNewTeachingPeriod()
    else
      updateExistingTeachingPeriod()
)

