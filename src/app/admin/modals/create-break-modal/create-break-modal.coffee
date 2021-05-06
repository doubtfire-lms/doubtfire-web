angular.module('doubtfire.admin.modals.create-break-modal', [])

.factory('CreateBreakModal', ($modal) ->
  CreateBreakModal = {}

  CreateBreakModal.show = (teachingPeriod) ->
    $modal.open
      templateUrl: 'admin/modals/create-break-modal/create-break-modal.tpl.html'
      controller: 'CreateBreakModal'
      resolve:
        teachingperiod: -> teachingPeriod

  CreateBreakModal
)

.controller('CreateBreakModal', ($scope, $modalInstance, alertService, analyticsService, teachingperiod, Break) ->
  analyticsService.event 'Teaching Period Admin', 'Started to Add Break'
  $scope.teachingperiod = teachingperiod

  $scope.calOptions = {
    startOpened: false
  }

  $scope.break = { start_date: null, number_of_weeks: null, teaching_period_id: $scope.teachingperiod.id }

  # Datepicker opener
  $scope.open = ($event, pickerData) ->
    $event.preventDefault()
    $event.stopPropagation()

    if pickerData == 'start'
      $scope.calOptions.startOpened = ! $scope.calOptions.startOpened

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  }

  $scope.addBreak = ->
    if $scope.break.start_date && $scope.break.start_date.getMonth
      $scope.break.start_date = "#{$scope.break.start_date.getFullYear()}-#{$scope.break.start_date.getMonth() + 1}-#{$scope.break.start_date.getDate()}"

    Break.create(
      $scope.break
      (response) ->
        alertService.add("success", "Break added.", 2000)
        $modalInstance.close()
        $scope.teachingperiod.breaks.push(response)
        analyticsService.event 'Teaching Period Admin', 'Added New Break'
      (response) ->
        alertService.add 'danger', "Error adding break - #{response.data.error}"
    )
)

