angular.module('doubtfire.config.root-controller', [])

#
# The Doubtfire root application controller
#
.controller("AppCtrl", ($rootScope, $state, $document, $filter, ExternalName, TeachingPeriod) ->

  # Automatically localise page titles
  # TODO: (@alexcu) consider putting this in a directive?
  suffix = $document.prop "title"
  setPageTitle = (state) ->
    $document.prop "title", $filter("i18n")(state.data.pageTitle) + " | " + suffix

  # $rootScope.$on "i18nReady", ->
  #   setPageTitle $state.current
  #   $rootScope.$on "$stateChangeSuccess", (evt, toState) -> setPageTitle toState

  # Get the confugurable, external name of Doubtfire
  $rootScope.externalName = ExternalName

  # Ensure that teaching periods are loaded
  TeachingPeriod.query()

)
