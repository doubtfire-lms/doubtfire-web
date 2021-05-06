angular.module('doubtfire.config.root-controller', [])

#
# The Doubtfire root application controller
#
.controller("AppCtrl", (TeachingPeriod, campusService) ->

  # Ensure that campuses are loaded
  campusService.query().subscribe()

  # Ensure that teaching periods are loaded
  TeachingPeriod.query()

)
