angular.module('doubtfire.teaching-periods.states.index', [])

#
# Root state for teaching periods
#
.config((headerServiceProvider) ->
  headerServiceProvider.state 'teaching-periods/index', {
    url: "/teaching-periods/:teachingPeriodId"
    abstract: true
    views:
      main:
        controller: "TeachingPeriodIndexStateCtrl"
        templateUrl: "teaching-periods/states/index/index.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Admin']
  }
)

.controller("TeachingPeriodIndexStateCtrl", ($scope, $state, $stateParams, listenerService, TeachingPeriod, alertService) ->
  # Error - required teachingPeriodId is missing!
  teachingPeriodId = +$stateParams.teachingPeriodId
  TeachingPeriod.query()

  TeachingPeriod.get(
    teachingPeriodId
    (success) -> $scope.teachingPeriod = success
    (failure) -> alertService.add("danger", "Failed to load teaching period. #{failure?.data?.error}", 6000)
  )

  return $state.go('home') unless teachingPeriodId
)
