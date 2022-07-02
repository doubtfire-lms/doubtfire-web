angular.module('doubtfire.teaching-periods.states.edit.directives.teaching-period-details-editor', [])

#
# Editor for the basic details of a teaching period, such as the name,
# start and end dates etc.
#
.directive('teachingPeriodDetailsEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-details-editor/teaching-period-details-editor.tpl.html'
  controller: ($scope, $state, DoubtfireConstants, alertService, newTeachingPeriodService) ->
    $scope.calOptions = {
      startOpened: false
      endOpened: false
      activeUntilOpened: false
    }

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

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
      if $scope.teachingPeriod.id == -1
        newTeachingPeriodService.create($scope.teachingPeriod).subscribe({
          next: (createdTeachingPeriod) ->
            $scope.teachingperiods.loadedPeriods.push(createdTeachingPeriod)
            alertService.add("success", "Teaching Period created.", 2000)
          error: (response) ->
            alertService.add("danger", response.data.error, 6000)
        })
      else
        newTeachingPeriodService.update( $scope.teachingPeriod ).subscribe({
          next: (updatedTeachingPeriod) ->
            alertService.add("success", "Teaching Period updated.", 2000)
          error: (response) ->
            alertService.add("danger", "Failed to update teaching period. #{response}", 6000)
        })
)
