#
# Runtime settings for when Doubtfire is about to launch
# 
angular.module('doubtfire.config.runtime', [])

.run(($rootScope, $state, $filter, $location, authenticationService, editableOptions, editableThemes, $transitions) ->
  # Angular xeditable
  editableOptions.theme = 'bs3'
  editableThemes.bs3.inputClass = 'input-sm'
  editableThemes.bs3.buttonsClass = 'btn-sm'

  handleUnauthorisedDest = (toState) ->
    if authenticationService.isAuthenticated()
      $state.go "unauthorised"
    else if $state.current.name isnt "sign_in"
      $state.go "sign_in"

  handleTokenTimeout = ->
    if $state.current.name isnt "timeout"
      $state.go "timeout"

  handleUnauthorised = ->
    handleUnauthorisedDest($state.current)

  # Don't let the user see pages not intended for their role

  # Redirect the user if they make an unauthorised API request
  $rootScope.$on "unauthorisedRequestIntercepted", handleUnauthorised

  # Redirect the user if their token expires
  $rootScope.$on("tokenTimeout", handleTokenTimeout)

  # Watch for state transition and check role whitelist
  $transitions.onStart {}, (trans) ->
    toState = trans.to()
    return true unless toState.data.roleWhitelist

    # Get the auth service to check this when the auth is complete
    authenticationService.afterAuthCall(
      (isAuthenticated) ->
        unless isAuthenticated && authenticationService.isAuthorised(toState.data.roleWhitelist)
          handleUnauthorisedDest(toState)
    )

    # We can always transition... but may have to redirect after auth call...
    return true
)
