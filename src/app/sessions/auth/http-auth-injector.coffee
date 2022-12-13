angular.module("doubtfire.sessions.auth.http-auth-injector", [])
#
# This module is responsible for injecting the auth credentials to
# all
#
.config(($httpProvider) ->
  $httpProvider.interceptors.push ($q, $rootScope, DoubtfireConstants, newUserService) ->
    #
    # Inject authentication token for requests
    #
    injectAuthForRequest = (request) ->
      # Intercept API requests and inject the auth token.
      if _.startsWith(request.url, DoubtfireConstants.API_URL) and newUserService.currentUser.authenticationToken?
        request.headers = {} unless _.has(request, "headers")
        request.headers.Auth_Token = newUserService.currentUser.authenticationToken
        request.headers.Username = newUserService.currentUser.username
      request or $q.when request

    #
    # Inject handlers for 419 and 401 response errors
    #
    injectAuthForResponseWithError = (response) ->
      # Intercept unauthorised API responses and fire an event.
      if response.config && response.config.url and _.startsWith(response.config.url, DoubtfireConstants.API_URL)
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
