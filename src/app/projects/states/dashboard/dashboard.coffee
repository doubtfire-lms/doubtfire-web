angular.module('doubtfire.projects.states.dashboard', [])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/dashboard', {
    parent: 'projects/index'
    url: '/dashboard/:taskAbbr'
    controller: 'ProjectsDashboardStateCtrl'
    templateUrl: 'projects/states/dashboard/dashboard.tpl.html'
    data:
      task: "Task Dashboard"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("ProjectsDashboardStateCtrl", ($scope, $rootScope, $state, $stateParams, UnitRole, unitService, projectService, listenerService) ->
  # Load in task task abbreveation
  $scope.taskAbbr = +$stateParams.taskAbbr
)
