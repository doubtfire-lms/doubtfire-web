angular.module('doubtfire.config.routing', [])
#
# Configuration for angular routing
#
.config(($urlRouterProvider, $httpProvider) ->
  # Catch bad URLs.
  $urlRouterProvider.otherwise "/not_found"
  $urlRouterProvider.when "", "/"

  # Map root/home URL to a default state of our choosing.
  # TODO: (@alexcu) probably change it to map to /dashboard at some point.
  $urlRouterProvider.when "/", "/home"
)
