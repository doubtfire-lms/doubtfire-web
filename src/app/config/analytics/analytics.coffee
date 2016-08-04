#
# Configuration for analytics
#
mod = angular.module('doubtfire.config.analytics', [])
.config( ($analyticsProvider) ->
  # Disable virtual page views for analytics
  $analyticsProvider.virtualPageviews(false)
)
module.exports = mod.name
