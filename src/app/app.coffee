# Define doubtfire
angular.module("doubtfire", [
  # ng*
  "ngCookies"
  "ngCsv"
  "ngSanitize"

  # templates
  "templates-app"
  "templates-common"

  # ui.*
  "ui.router"
  "ui.bootstrap"
  "ui.codemirror"
  "ui.select"

  # other libraries
  "angularFileUpload"
  "angular.filter"
  "localization"
  "markdown"
  "nvd3"
  "xeditable"

  # analytics
  "angulartics"
  "angulartics.debug"
  "angulartics.google.analytics"

  # doubtfire.*
  "doubtfire.sessions"
  "doubtfire.common"
  "doubtfire.errors"
  "doubtfire.home"
  "doubtfire.units"
  "doubtfire.tasks"
  "doubtfire.projects"
  "doubtfire.users"
  "doubtfire.groups"
  "doubtfire.visualisations"
])
.constant('DoubtfireContributors', [
  #
  # Add contributors to Doubtfire here, which should be their GitHub usernames
  #
  'macite'              # Andrew Cain
  'apj'                 # Allan Jones
  'alexcu'              # Alex Cummaudo
  'joostfunkekupper'    # Joost Funke Kupper
  'rohanliston'         # Rohan Liston
  'lukehorvat'          # Luke Horvat
  'hellola'             # Evo Kellerman
  'AvDongle'            # Cliff Warren

  #
  # TODO: Find out account names for...
  # '???'                 # Reuben Wilson
  # '???'                 # Angus Morton
  #
])
# Local Storage Config
.config((localStorageServiceProvider) ->
  localStorageServiceProvider.setPrefix('doubtfire')
)
# Routing Config
.config(($urlRouterProvider, $httpProvider, $analyticsProvider) ->
  # Catch bad URLs.
  $urlRouterProvider.otherwise "/not_found"
  $urlRouterProvider.when "", "/"

  # Map root/home URL to a default state of our choosing.
  # TODO: probably change it to map to /dashboard at some point.
  $urlRouterProvider.when "/", "/home"

  # Disable virtual page views for analytics
  $analyticsProvider.virtualPageviews(false)
)
# Doubtfire run
.run(($rootScope, $state, $filter, $location, auth, editableOptions) ->
  editableOptions.theme = 'bs3'

  serialize = (obj, prefix) ->
    str = []
    for p, v of obj
      k = if prefix then prefix + "[" + p + "]" else p
      if typeof v == "object"
        str.push(serialize(v, k))
      else
        str.push(encodeURIComponent(k) + "=" + encodeURIComponent(v))

    str.join("&")

  handleUnauthorisedDest = (toState, toParams) ->
    if auth.isAuthenticated()
      $state.go "unauthorised"
    else if $state.current.name isnt "sign_in"
      $state.go "sign_in", { dest: toState.name, params: serialize(toParams) }

  handleTokenTimeout = ->
    if $state.current.name isnt "timeout"
      $state.go "timeout", { dest: $state.current.name, params: serialize($state.params) }

  handleUnauthorised = ->
    handleUnauthorisedDest($state.current, $state.params)

  # Don't let the user see pages not intended for their role
  $rootScope.$on "$stateChangeStart", (evt, toState, toParams) ->
    unless auth.isAuthorised toState.data.roleWhitelist
      evt.preventDefault()
      handleUnauthorisedDest(toState, toParams)

  # Redirect the user if they make an unauthorised API request
  $rootScope.$on "unauthorisedRequestIntercepted", handleUnauthorised
  # Redirect the user if their token expires
  $rootScope.$on "tokenTimeout", handleTokenTimeout

  _.mixin(_.string.exports())
)
# Root application controller
.controller("AppCtrl", ($rootScope, $state, $document, $filter) ->

  # Automatically localise page titles
  # TODO: consider putting this in a directive?
  suffix = $document.prop "title"
  setPageTitle = (state) ->
    $document.prop "title", $filter("i18n")(state.data.pageTitle) + " | " + suffix

  # $rootScope.$on "i18nReady", ->
  #   setPageTitle $state.current
  #   $rootScope.$on "$stateChangeSuccess", (evt, toState) -> setPageTitle toState
)


# Debug helper method
scope = ($0) ->
  throw new Error "Select a DOM element using 'Inspect Element' first, then call using scope($0)" unless $0?
  angular.element($0).scope()
