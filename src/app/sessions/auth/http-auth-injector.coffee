#
# This module is responsible for injecting the auth credentials to
# all
_ = require('lodash')

mod = angular.module("doubtfire.sessions.auth.http-auth-injector", [])

.config(($httpProvider) ->
  $httpProvider.interceptors.push ($q, $rootScope, api, currentUser) ->
    #
    # Inject authentication token for requests
    #
    injectAuthForRequest = (request) ->
      # Intercept API requests and inject the auth token.
      if _.string.startsWith(request.url, api) and currentUser.authenticationToken?
        request.params = {} unless _.has request, "params"
        request.params.auth_token = currentUser.authenticationToken
      request or $q.when request

    #
    # Inject handlers for 419 and 401 response errors
    #
    injectAuthForResponseWithError = (response) ->
      # Intercept unauthorised API responses and fire an event.
      if response.config && response.config.url and _.string.startsWith(response.config.url, api)
        # Timeout?
        if response.status is 419
          $rootScope.$broadcast "tokenTimeout"
        # Unauthorised?
        else if response.status is 401
          $rootScope.$broadcast "unauthorisedRequestIntercepted"
      $q.reject response

    {
      request: injectAuthForRequest
      responseError: injectAuthForResponseWithError
    }
)

module.exports = mod.name
