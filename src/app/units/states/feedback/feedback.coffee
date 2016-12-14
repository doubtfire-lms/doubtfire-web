angular.module('doubtfire.units.states.feedback', [])

#
# Teacher child state for units
#
.config(($stateProvider) ->
  $stateProvider.state 'units#feedback', {
    parent: 'units#index'
    title: "Give Student Feedback"
    url: ''
    views:
      unitIndex:
        controller: "UnitFeedbackCtrl"
        templateUrl: "units/states/feedback/feedback.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller("UnitFeedbackCtrl", ($scope, $state, $stateParams, UnitRole, unitService) ->

)
