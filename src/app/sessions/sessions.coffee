angular.module("doubtfire.sessions", [
  "ngCookies"
  "ui.router"
  "doubtfire.api"
]).constant("authRoles", [
  "anon"
  "basic"
  "admin"
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
    url: "/sign_in"
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

).factory("auth", ($http, $cookieStore, userCookieName, currentUser, authRoles) ->

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
  tryChangeUser $cookieStore.get(userCookieName)

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
        profile:
          name: response.user.first_name + " " + response.user.last_name
          nickname: response.user.nickname

      if tryChangeUser user
        success()
      else
        error()
    ).error error

  signOut: -> tryChangeUser defaultAnonymousUser

).controller("SignInCtrl", ($scope, $state, $timeout, $modal, currentUser, auth, api) ->

  stateAfterSignIn = "home" # TODO: Make this a constant

  if auth.isAuthenticated()
    $state.go stateAfterSignIn
  else
    $scope.signIn = ->
      auth.signIn api + "/auth",
        email: $scope.session.email
        password: $scope.session.password
      , ->
        $state.go stateAfterSignIn
      # , ->
      #   # If error alert already showing, delay before showing the new sign-in error. Looks better.
      #   if flash.now.has "error"
      #     flash.now.remove "error"
      #     $timeout(->
      #       flash.now.set "error", "_Failed to sign in. Your username and/or password may be incorrect._"
      #     , 150)

).controller "SignOutCtrl", ($state, $timeout, auth) ->
  if auth.signOut()
    $timeout (-> $state.go "sign_in"), 750
  return this
