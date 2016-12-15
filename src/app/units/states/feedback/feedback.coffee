angular.module('doubtfire.units.states.feedback', [
  'doubtfire.units.states.feedback.tasks-list'
  'doubtfire.units.states.feedback.task-commenter'
  'doubtfire.units.states.feedback.task-submission'
])

#
# Teacher child state for units
#
.config(($stateProvider) ->
  $stateProvider.state 'units#feedback', {
    parent: 'units#index'
    title: "Give Student Feedback"
    url: '/feedback?task'
    views:
      unitIndex:
        templateUrl: "units/states/feedback/feedback.tpl.html"
        controller: "UnitFeedbackCtrl"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('UnitFeedbackCtrl', ($scope) ->

)
