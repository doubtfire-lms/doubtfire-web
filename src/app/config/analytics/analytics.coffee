angular.module('doubtfire.config.analytics', [])
#
# Configuration for analytics
#
.config( ($analyticsProvider) ->
  # Disable virtual page views for analytics
  $analyticsProvider.virtualPageviews(false)
)
