angular.module('doubtfire.projects.states.feedback', [])

#
# Skips directly to feedback view (is a child of projects#show)
# of a specific task id
#
# This may be completely gone...
# .config(($stateProvider) ->
#   projectsFeedbackStateData =
#     url: ":viewing/:showTaskId"
#     parent: 'projects#show'
#   $stateProvider.state "projects#feedback", projectsFeedbackStateData
# )
