#
# Globals
#

statusKeys = [
  'not_submitted',
  'fix_and_include',
  'redo',
  'need_help',
  'working_on_it',
  'fix_and_resubmit',
  'ready_to_mark',
  'discuss',
  'complete'
]

statusLabels = {
  'ready_to_mark':      'Ready to Mark',
  'not_submitted':      'Not Started',
  'working_on_it':      'Working On It',
  'need_help':          'Need Help',
  'redo':               'Redo',
  'fix_and_include':    'Fix and Include',
  'fix_and_resubmit':   'Resubmit',
  'discuss':            'Discuss',
  'complete':           'Complete'
}

statusIcons = {
  'ready_to_mark':      'fa fa-thumbs-o-up',
  'not_submitted':      'fa fa-times',
  'working_on_it':      'fa fa-bolt',
  'need_help':          'fa fa-question-circle',
  'redo':               'fa fa-refresh',
  'fix_and_include':    'fa fa-stop',
  'fix_and_resubmit':   'fa fa-wrench',
  'discuss':            'fa fa-comment',
  'complete':           'fa fa-check-circle-o'
}


angular.module("doubtfire", [
  "ngCookies"
  "templates-app"
  "templates-common"
  "localization"
  
  "ui.router"
  "ui.bootstrap"
  # "mgcrea.ngStrap"

  "doubtfire.api"
  "doubtfire.errors"
  "doubtfire.sessions"
  "doubtfire.header"

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
