angular.module('doubtfire.units.unit-details-editor', [])

.directive('adminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-context.tpl.html'
  controller: ($scope, $state, $rootScope, Unit, alertService, unitService) ->
    $scope.format = 'yyyy-MM-dd'
    $scope.initDate = new Date('2016-04-20')

    $scope.calOptions = {
      startOpened: false
      endOpened: false
    }

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
    $scope.unitTypeAheadData = unitService.unitTypeAheadData
    $scope.studentSearch = ""

    $scope.saveUnit = ->
      if $scope.unit.convenors then delete $scope.unit.convenors

      if $scope.unit.start_date && $scope.unit.start_date.getMonth
        $scope.unit.start_date = "#{$scope.unit.start_date.getFullYear()}-#{$scope.unit.start_date.getMonth() + 1}-#{$scope.unit.start_date.getDate()}"
      if $scope.unit.end_date && $scope.unit.end_date.getMonth
        $scope.unit.end_date = "#{$scope.unit.end_date.getFullYear()}-#{$scope.unit.end_date.getMonth() + 1}-#{$scope.unit.end_date.getDate()}"

      saveData = {
        name: $scope.unit.name
        code: $scope.unit.code
        description: $scope.unit.description
        start_date: $scope.unit.start_date
        end_date: $scope.unit.end_date
        active: $scope.unit.active
      }

      if $scope.unit.id == -1
        Unit.create { unit: saveData },
          (unit) ->
            $scope.saveSuccess(unit)
          (response) ->
            alertService.add("danger", response.data.error, 6000)
      else
        Unit.update(
          {
            id: $scope.unit.id
            unit: saveData
          }, (unit) ->
            alertService.add("success", "Unit updated.", 2000)
          (response) ->
            alertService.add("danger", "Failed to update unit. #{response.error}", 6000)
        )
)
