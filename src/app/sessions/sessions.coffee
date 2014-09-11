angular.module("doubtfire.sessions", [
  "ngCookies"
  "LocalStorageModule"
  "ui.router"
  "doubtfire.api"
]).constant("authRoles", [
  "anon"
  "Student"
  "Tutor"
  "Convenor"
  "Admin"
]).constant("currentUser",

  id: 0
  role: "anon"
  profile:
    name: "Anonymous"
    nickname: "anon"

).constant("userCookieName", "doubtfire_user"

).directive("ifRole", (auth) ->

  restrict: "A"
  link: (scope, element, attrs) ->
    roleWhitelist = _.string.words(attrs.ifRole)
    element.remove() if not auth.isAuthorised roleWhitelist

).config(($stateProvider) ->

  $stateProvider.state("sign_in",
    url: "/sign_in?dest&params"
    views:
      main:
        controller: "SignInCtrl"
        templateUrl: "sessions/sign_in.tpl.html"
    data:
      pageTitle: "_Sign In_"
  ).state("sign_out",
    url: "/sign_out"
    views:
      main:
        controller: "SignOutCtrl"
        templateUrl: "sessions/sign_out.tpl.html"
    data:
      pageTitle: "_Sign Out_"
  )

).config(($httpProvider) ->

  $httpProvider.interceptors.push ($q, $rootScope, api, currentUser) ->
    request: (config) ->
      # Intercept API requests and inject the auth token.
      if _.string.startsWith(config.url, api) and currentUser.authenticationToken?
        config.params = {} if not _.has config, "params"
        config.params.auth_token = currentUser.authenticationToken
      config or $q.when config

    responseError: (response) ->
      # Intercept unauthorised API responses and fire an event.
      if _.string.startsWith(response.config.url, api) and response.status is 401
        $rootScope.$broadcast "unauthorisedRequestIntercepted"
      $q.reject response

).factory("auth", ($http, $cookieStore, userCookieName, currentUser, authRoles, localStorageService) ->

  # Private factory methods.
  tryChangeUser = (user) ->
    if user? and user.role in authRoles
      # Clear the current user object and populate it with the new values.
      # Note how the actual user object reference doesn't change.
      delete currentUser[prop] for prop of currentUser
      _.extend currentUser, user
      $cookieStore.put userCookieName, currentUser
      return true
    else
      return false

  isValidRoleWhitelist = (roleWhitelist) ->
    _.difference(roleWhitelist, authRoles).length == 0

  defaultAnonymousUser = _.clone currentUser
  if not tryChangeUser $cookieStore.get(userCookieName)
    tryChangeUser localStorageService.get(userCookieName)

  # Public factory methods to expose.
  isAuthenticated: ->
    not _.isEqual currentUser, defaultAnonymousUser

  isAuthorised: (roleWhitelist, role = currentUser.role) ->
    not roleWhitelist? or (isValidRoleWhitelist(roleWhitelist) and role in roleWhitelist)

  signIn: (authenticationUrl, userCredentials, success, error) ->
    success ?= ->
    error ?= ->

    $http.post(authenticationUrl,
      userCredentials
    ).success((response) ->
      # Extract relevant data from response and construct user object to store in cache.
      user =
        id: response.user.id
        authenticationToken: response.auth_token
        role: _.string.camelize(response.user.system_role)
        profile: response.user

      if tryChangeUser user
        success()
      else
        error()
    ).error error

  signOut: (authenticationUrl) ->
    $http.delete(authenticationUrl)
    tryChangeUser defaultAnonymousUser
    localStorageService.remove(userCookieName)

).controller("SignInCtrl", ($scope, $state, $stateParams, userCookieName, $timeout, $modal, currentUser, auth, api, alertService, localStorageService) ->
  $scope.remember_me = true

  #TODO: need to test multiple params and nested objects here
  deserialize = (str, prefix) ->
    result = {}
    parts = str.split "&"

    for i, attr of parts
      kv = attr.split "="
      k = kv[0]
      v = kv[1]
      result[k] = v

    result

  stateAfterSignIn = "home" # TODO: Make this a constant
  newStateParams = {}
  if $stateParams["dest"]
    stateAfterSignIn = $stateParams["dest"]
    newStateParams = deserialize $stateParams["params"]

  if auth.isAuthenticated()
    $state.go stateAfterSignIn, newStateParams
  else
    $scope.signIn = ->
      auth.signIn api + "/auth",
        username: $scope.session.username
        password: $scope.session.password
      , ->
        $state.go stateAfterSignIn, newStateParams
        if $scope.remember_me
          localStorageService.set(userCookieName, currentUser)
        else
          localStorageService.remove(userCookieName)
      , (response) ->
        $scope.session.password = ''
        alertService.add("danger", "Login failed: " + response.error, 6000)

).controller "SignOutCtrl", ($state, $timeout, auth, api, currentUser) ->
  if auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $timeout (-> $state.go "sign_in"), 750
  return this
