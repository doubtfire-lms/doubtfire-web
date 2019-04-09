angular.module('doubtfire.teaching-periods.states.edit.directives.teaching-period-details-editor', [])

#
# Editor for the basic details of a teaching period, such as the name,
# start and end dates etc.
#
.directive('teachingPeriodDetailsEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-details-editor/teaching-period-details-editor.tpl.html'
  controller: ($scope, $state, ExternalName, alertService, TeachingPeriod) ->
    $scope.calOptions = {
      startOpened: false
      endOpened: false
      activeUntilOpened: false
    }

    TeachingPeriod.query()

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = ExternalName

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
      if $scope.teachingPeriod.start_date && $scope.teachingPeriod.start_date.getMonth
        $scope.teachingPeriod.start_date = "#{$scope.teachingPeriod.start_date.getFullYear()}-#{$scope.teachingPeriod.start_date.getMonth() + 1}-#{$scope.teachingPeriod.start_date.getDate()}"
      if $scope.teachingPeriod.end_date && $scope.teachingPeriod.end_date.getMonth
        $scope.teachingPeriod.end_date = "#{$scope.teachingPeriod.end_date.getFullYear()}-#{$scope.teachingPeriod.end_date.getMonth() + 1}-#{$scope.teachingPeriod.end_date.getDate()}"
      if $scope.teachingPeriod.active_until && $scope.teachingPeriod.active_until.getMonth
        $scope.teachingPeriod.active_until = "#{$scope.teachingPeriod.active_until.getFullYear()}-#{$scope.teachingPeriod.active_until.getMonth() + 1}-#{$scope.teachingPeriod.active_until.getDate()}"

      saveData = {
        period: $scope.teachingPeriod.period
        year: $scope.teachingPeriod.year
        start_date: $scope.teachingPeriod.start_date
        end_date: $scope.teachingPeriod.end_date
        active_until: $scope.teachingPeriod.active_until
      }

      if $scope.teachingPeriod.id == -1
        TeachingPeriod.create { teaching_period: saveData },
          (createdTeachingPeriod) ->
            $scope.teachingperiods.loadedPeriods.push(createdTeachingPeriod)
            alertService.add("success", "Teaching Period created.", 2000)
          (response) ->
            alertService.add("danger", response.data.error, 6000)
      else
        TeachingPeriod.update( { id: $scope.teachingPeriod.id, teaching_period: saveData } ).$promise.then (
          (updatedTeachingPeriod) ->
            alertService.add("success", "Teaching Period updated.", 2000)
        ),
        (response) ->
          alertService.add("danger", "Failed to update teaching period. #{response.data.error}", 6000)
)