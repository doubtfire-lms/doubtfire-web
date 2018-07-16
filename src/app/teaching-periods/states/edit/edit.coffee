angular.module('doubtfire.teaching-periods.states.edit', [
  'doubtfire.teaching-periods.states.edit.directives'
])

.config(($stateProvider) ->
  $stateProvider.state 'teaching-periods/admin', {
    parent: 'teaching-periods/index'
    url: '/admin'
    controller: 'EditTeachingPeriodStateCtrl'
    templateUrl: 'teaching-periods/states/edit/edit.tpl.html'
    data:
      pageTitle: "_Teaching-Period Administration_"
      roleWhitelist: ['Admin']
  }
)

.controller("EditTeachingPeriodStateCtrl", ($scope, $state, TeachingPeriod, alertService, analyticsService) ->
  analyticsService.event 'Edit Teaching Period View', "Started Edit Teaching Period View"

  TeachingPeriod.get(
    $state.params.teachingPeriodId
    (success) ->
      $scope.teachingPeriod = success
      $scope.newTeachingPeriod = $scope.teachingPeriod.id == -1

    (failure) -> alertService.add("danger", "Failed to load teaching period. #{failure?.data?.error}", 6000)
  )
)