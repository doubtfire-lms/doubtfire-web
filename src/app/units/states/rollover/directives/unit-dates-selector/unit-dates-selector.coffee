angular.module('doubtfire.units.states.rollover.directives.unit-dates-selector', [])

#
# Editor for the basic details of a unit, such as the name, code
# start and end dates etc.
#
.directive('unitDatesSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/rollover/directives/unit-dates-selector/unit-dates-selector.tpl.html'
  controller: ($scope, $state, $rootScope, ExternalName, Unit, RolloverUnit, alertService, analyticsService, unitService, TeachingPeriod) ->
    $scope.calOptions = {
      startOpened: false
      endOpened: false
    }

    # Get the configurable, external name of Doubtfire
    $scope.externalName = ExternalName

    # get the teaching periods- gets an object with the loaded teaching periods
    $scope.teachingPeriods = TeachingPeriod.query()

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

    $scope.saveUnit = ->
      if $scope.unit.convenors then delete $scope.unit.convenors

      #Assign unit roles to null, otherwise it will not update the role in unit list
      unitService.loadedUnitRoles = null

      if $scope.unit.start_date && $scope.unit.start_date.getMonth
        $scope.unit.start_date = "#{$scope.unit.start_date.getFullYear()}-#{$scope.unit.start_date.getMonth() + 1}-#{$scope.unit.start_date.getDate()}"
      if $scope.unit.end_date && $scope.unit.end_date.getMonth
        $scope.unit.end_date = "#{$scope.unit.end_date.getFullYear()}-#{$scope.unit.end_date.getMonth() + 1}-#{$scope.unit.end_date.getDate()}"

      if $scope.unit.teaching_period_id
        saveData = {
          id: $scope.unit.id
          teaching_period_id: $scope.unit.teaching_period_id
        }
      else
        saveData = {
          id: $scope.unit.id
          start_date: $scope.unit.start_date
          end_date: $scope.unit.end_date
        }

      RolloverUnit.create(
        saveData
        (response) ->
          alertService.add("success", "Unit created.", 2000)
          analyticsService.event 'Unit Admin', 'Saved New Unit'
          $state.go("admin/units")
        (response) ->
          alertService.add 'danger', "Error creating unit - #{response.data.error}"
      )

)
