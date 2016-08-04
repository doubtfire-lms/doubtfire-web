#
# The Doubtfire root application controller
#
mod = angular.module('doubtfire.config.root-controller', [])
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
module.exports = mod.name
