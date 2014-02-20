angular.module("wangular-grunt", [
  "ngCookies"
  "templates-app"
  "templates-common"
  "localization"
  
  "ui.router"
  "ui.bootstrap"

  "wangular-grunt.api"

  "wangular-grunt.home"
])
.config(($urlRouterProvider, $httpProvider) ->

  # Catch bad URLs.
  $urlRouterProvider.otherwise "/not_found"
  $urlRouterProvider.when "", "/"

  # Map root/home URL to a default state of our choosing.
  # TODO: probably change it to map to /dashboard at some point.
  $urlRouterProvider.when "/", "/home"

).run(($rootScope, $state, $filter) ->
  _.mixin(_.string.exports())
).controller "AppCtrl", ($rootScope, $state, $document, $filter) ->

  # Automatically localise page titles
  # TODO: consider putting this in a directive?
  suffix = $document.prop "title"
  setPageTitle = (state) ->
    $document.prop "title", $filter("i18n")(state.data.pageTitle) + " | " + suffix

  $rootScope.$on "i18nReady", ->
    setPageTitle $state.current
    $rootScope.$on "$stateChangeSuccess", (evt, toState) -> setPageTitle toState
