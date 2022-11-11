angular.module('doubtfire.units.states.rollover.directives.unit-dates-selector', [])

#
# Editor for the basic details of a unit, such as the name, code
# start and end dates etc.
#
.directive('unitDatesSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/rollover/directives/unit-dates-selector/unit-dates-selector.tpl.html'
  controller: ($scope, $state, $rootScope, DoubtfireConstants, alertService, newTeachingPeriodService) ->
    $scope.calOptions = {
      startOpened: false
      endOpened: false
    }

    # Get the configurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    $scope.saveData = {
      id: $scope.unit.id,
      toPeriod: null,
      startDate: null,
      endDate: null
    }

    # get the teaching periods- gets an object with the loaded teaching periods
    newTeachingPeriodService.cache.values.subscribe(
      (periods) ->
        $scope.teachingPeriodValues = [{value: undefined, text: "None"}]
        other = periods.filter((tp) -> tp.endDate > Date.now()).map((p) -> {value: p, text: "#{p.year} #{p.period}"})
        _.each other, (d) -> $scope.teachingPeriodValues.push(d)

        if (periods.length > 0)
          $scope.saveData.toPeriod = periods[periods.length - 1]
    )

    $scope.teachingPeriodSelected = ($event) ->
      $scope.saveData.toPeriod = $event

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
      if $scope.saveData.toPeriod
        body = {
          teaching_period_id: $scope.saveData.toPeriod.id
        }
      else
        body = {
          start_date: $scope.saveData.startDate
          end_date: $scope.saeData.endDate
        }
      $scope.unit.rolloverTo(body).subscribe({
        next: (response) ->
          alertService.add("success", "Unit created.", 2000)
          $state.go("units/admin", {unitId: response.id})
        error: (response) ->
          alertService.add 'danger', "Error creating unit - #{response}"

      })



)
