angular.module('doubtfire.projects.states.performance-bands', [])

#
# Performance Bands visualisation state
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/performance-bands', {
    parent: 'projects/index'
    url: '/performance-bands'
    controller: 'PerformanceBandsStateCtrl'
    templateUrl: 'projects/states/performance-bands/performance-bands.tpl.html'
    data:
      task: "Performance Bands"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student', 'Auditor']
   }
)

.controller("PerformanceBandsStateCtrl", ($scope) ->
  # The actual performance-bands directive is handling the logic and data fetching internally.
  # So we just need an empty controller to hook up the scope if needed.
)
