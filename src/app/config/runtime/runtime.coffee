#
# Runtime settings for when Doubtfire is about to launch
#
angular.module('doubtfire.config.runtime', [])

.run(($rootScope, $state, $filter, $location, auth, editableOptions, editableThemes) ->
  # Angular xeditable
  editableOptions.theme = 'bs3'
  editableThemes.bs3.inputClass = 'input-sm'
  editableThemes.bs3.buttonsClass = 'btn-sm'

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

)
