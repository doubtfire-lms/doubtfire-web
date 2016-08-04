mod = angular.module('doubtfire.projects.states.feedback', [])

#
# Skips directly to feedback view (is a child of projects#show)
# of a specific task id
#
.config(($stateProvider) ->
  projectsFeedbackStateData =
    url: ":viewing/:showTaskId"
    parent: 'projects#show'
  $stateProvider.state "projects#feedback", projectsFeedbackStateData
)

module.exports = mod.name
