angular.module('doubtfire.units.states.edit.directives.unit-details-editor', [])

#
# Editor for the basic details of a unit, such as the name, code
# start and end dates etc.
#
.directive('unitDetailsEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-details-editor/unit-details-editor.tpl.html'
  controller: ($scope, $state, $rootScope, DoubtfireConstants, newUnitService, alertService, newTeachingPeriodService, TaskSubmission) ->
    $scope.overseerEnabled = DoubtfireConstants.IsOverseerEnabled

    $scope.calOptions = {
      startOpened: false
      endOpened: false
      portfolioAutoGenerationOpened: false
    }

    # Get docker images available for automated task assessment for the unit.
    TaskSubmission.getDockerImagesAsPromise().then (images) ->
      $scope.dockerImages = images

    # Get the confugurable, external name of Doubtfire
    $scope.externalName = DoubtfireConstants.ExternalName

    # get the teaching periods- gets an object with the loaded teaching periods
    newTeachingPeriodService.query().subscribe((periods) ->
      $scope.teachingPeriods = periods
      $scope.teachingPeriodValues = [{value: undefined, text: "None"}]
      other = _.map periods, (p) -> {value: p, text: "#{p.year} #{p.period}"}
      _.each other, (d) -> $scope.teachingPeriodValues.push(d)
    )

    $scope.teachingPeriodSelected = ($event) ->
      $scope.unit.teachingPeriod = $event

    $scope.unit.taskDefinitionCache.values.subscribe(
      (taskDefs) ->
        $scope.taskDefinitionValues = [{value: undefined, text: "None"}]
        other = _.map taskDefs, (td) -> {value: td, text: "#{td.abbreviation}-#{td.name}"}
        _.each other, (d) -> $scope.taskDefinitionValues.push(d)
    )

    $scope.draftTaskDefSelected = ($event) ->
      $scope.unit.draftTaskDefinition = $event

    # Datepicker opener
    $scope.open = ($event, pickerData) ->
      $event.preventDefault()
      $event.stopPropagation()

      if pickerData == 'start'
        $scope.calOptions.startOpened = ! $scope.calOptions.startOpened
        $scope.calOptions.endOpened = false
        $scope.calOptions.portfolioAutoGenerationOpened = false
      else if pickerData == 'end'
        $scope.calOptions.startOpened = false
        $scope.calOptions.endOpened = ! $scope.calOptions.endOpened
        $scope.calOptions.portfolioAutoGenerationOpened = false
      else if pickerData == 'autogen'
        $scope.calOptions.startOpened = false
        $scope.calOptions.endOpened = false
        $scope.calOptions.portfolioAutoGenerationOpened = ! $scope.calOptions.portfolioAutoGenerationOpened

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    }
    $scope.studentSearch = ""

    $scope.saveUnit = ->
      newUnitService.update($scope.unit).subscribe({
        next: (unit) ->
          alertService.add("success", "Unit updated.", 2000)
        error: (response) ->
          alertService.add("danger", "Failed to update unit. #{response}", 6000)
    })

)




