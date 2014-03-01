angular.module("doubtfire", [
  "ngCookies"
  "templates-app"
  "templates-common"
  "localization"
  
  "ui.router"
  "ui.bootstrap"

  "doubtfire.api"
  "doubtfire.errors"
  "doubtfire.sessions"

  "doubtfire.home"
  "doubtfire.units"
  "doubtfire.tasks"
])
.config(($urlRouterProvider, $httpProvider) ->

  # Catch bad URLs.
  $urlRouterProvider.otherwise "/not_found"
  $urlRouterProvider.when "", "/"

  # Map root/home URL to a default state of our choosing.
  # TODO: probably change it to map to /dashboard at some point.
  $urlRouterProvider.when "/", "/home"

).run(($rootScope, $state, $filter, auth) ->

  handleUnauthorised = ->
    if auth.isAuthenticated()
      $state.go "unauthorised"
    else if $state.current.name isnt "sign_in"
      $state.go "sign_in"

  # Don't let the user see pages not intended for their role
  $rootScope.$on "$stateChangeStart", (evt, toState) ->
    unless auth.isAuthorised toState.data.roleWhitelist
      evt.preventDefault()
      handleUnauthorised()

  # Redirect the user if they make an unauthorised API request
  $rootScope.$on "unauthorisedRequestIntercepted", handleUnauthorised

  _.mixin(_.string.exports())
).controller "AppCtrl", ($rootScope, $state, $document, $filter) ->

  # Automatically localise page titles
  # TODO: consider putting this in a directive?
  suffix = $document.prop "title"
  setPageTitle = (state) ->
    $document.prop "title", $filter("i18n")(state.data.pageTitle) + " | " + suffix

  # $rootScope.$on "i18nReady", ->
  #   setPageTitle $state.current
  #   $rootScope.$on "$stateChangeSuccess", (evt, toState) -> setPageTitle toState
