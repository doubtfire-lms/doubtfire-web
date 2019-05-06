angular.module('doubtfire.config.root-controller', [])

#
# The Doubtfire root application controller
#
.controller("AppCtrl", (TeachingPeriod) ->

  # Ensure that teaching periods are loaded
  TeachingPeriod.query()

)
