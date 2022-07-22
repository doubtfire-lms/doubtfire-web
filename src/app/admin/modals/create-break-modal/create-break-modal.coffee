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

  $scope.break = { startDate: null, numberOfWeeks: null, teachingPeriod: $scope.teachingperiod }

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
    $scope.teachingperiod.addBreak($scope.break.startDate, $scope.break.numberOfWeeks).subscribe({
      next: (response) ->
        alertService.add("success", "Break added.", 2000)
        $modalInstance.close()
      error: (response) ->
        alertService.add 'danger', "Error adding break - #{response}"
    })

)

