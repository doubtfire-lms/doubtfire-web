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
)
.constant("userCookieName", "doubtfire_user")
.constant("rememberDoubtfireCookie", "remember_doubtfire_token")
.constant("doubtfireLoginTimeCookie", "doubtfire_login_time")

.directive("ifRole", (auth) ->

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
      if response.config && response.config.url and _.string.startsWith(response.config.url, api)
        if response.status is 419
          $rootScope.$broadcast "tokenTimeout"
        else if response.status is 401
          $rootScope.$broadcast "unauthorisedRequestIntercepted"
      $q.reject response

).factory("auth", ($http, $cookieStore, $timeout, userCookieName, currentUser, authRoles, localStorageService, doubtfireLoginTimeCookie, rememberDoubtfireCookie, api, $rootScope) ->

  defaultAnonymousUser = _.clone currentUser

  checkAuth = () ->
    not _.isEqual currentUser, defaultAnonymousUser

  saveCurrentUser = () ->
    localStorageService.set(userCookieName, currentUser)
    $cookieStore.put userCookieName, currentUser

  updateAuth = (authenticationUrl) ->
    if not checkAuth()
      return

    remember = localStorageService.get(rememberDoubtfireCookie)
    localStorageService.set(doubtfireLoginTimeCookie, new Date().getTime())

    $http.put(authenticationUrl,
      username: currentUser.profile.username
      remember: remember
    ).success((response) ->
      currentUser.authenticationToken = response.auth_token
      saveCurrentUser()

      $timeout (( ) -> updateAuth api + "/auth/" + currentUser.authenticationToken + ".json"), 1000*60*60
    )

  # Private factory methods.
  tryChangeUser = (user) ->
    if user? and user.role in authRoles
      # Clear the current user object and populate it with the new values.
      # Note how the actual user object reference doesn't change.
      delete currentUser[prop] for prop of currentUser
      _.extend currentUser, user
      if checkAuth()
        saveCurrentUser()
      else
        $cookieStore.remove userCookieName
        localStorageService.remove userCookieName
      return true
    else
      return false

  isValidRoleWhitelist = (roleWhitelist) ->
    _.difference(roleWhitelist, authRoles).length == 0

  if not tryChangeUser $cookieStore.get(userCookieName)
    tryChangeUser localStorageService.get(userCookieName)

  auth = {}

  auth.saveCurrentUser = saveCurrentUser

  auth.isAuthenticated = checkAuth

  auth.isAuthorised = (roleWhitelist, role = currentUser.role) ->
    not roleWhitelist? or (isValidRoleWhitelist(roleWhitelist) and role in roleWhitelist)

  auth.signIn = (authenticationUrl, userCredentials, success, error) ->
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

      $timeout (( ) -> updateAuth api + "/auth/" + currentUser.authenticationToken + ".json"), 1000*60*60

      if tryChangeUser user
        success()
      else
        error()
    ).error error

  auth.signOut = (authenticationUrl) ->
    $http.delete(authenticationUrl)
    tryChangeUser defaultAnonymousUser
    $rootScope.$broadcast "signOut"
    localStorageService.remove(userCookieName)
    localStorageService.set(rememberDoubtfireCookie, false)
    localStorageService.remove(doubtfireLoginTimeCookie)

  # If the user is logged in then check if we should update their token
  if checkAuth()
    nowTime = new Date().getTime()
    endTime = parseInt(localStorageService.get(doubtfireLoginTimeCookie), 10) + 1000*60*60
    delayTime = endTime - nowTime

    if delayTime < 100
      delayTime = 100

    $timeout (( ) -> updateAuth api + "/auth/" + currentUser.authenticationToken + ".json"), delayTime

  # Return the auth object
  auth
).controller("SignInCtrl", ($scope, $state, $stateParams, userCookieName, $timeout, $modal, currentUser, auth, api, alertService, localStorageService, redirectService, rememberDoubtfireCookie, doubtfireLoginTimeCookie, AboutDoubtfireModal) ->

  isIE = ->
    window.navigator.appName is "Microsoft Internet Explorer"
  ieVersion = ->
    matches = new RegExp(" MSIE ([0-9].[0-9]);").exec(window.navigator.userAgent)
    return parseInt(matches[1].replace(".0", "")) if matches? and matches.length > 1
    true

  $scope.isIE = isIE() and ieVersion() < 11 # Support IE11

  $scope.session = { remember_me: true }

  # April Fools Easter Egg :-)
  angular.element(document).ready ->
    today = new Date()
    aprilFools =  today.getDate()   is 1 and # first day of the
                  today.getMonth()  is 3     # fourth month (April - zero-based)
    if aprilFools
      h1   = document.querySelector('.landing-page h1.logo')
      logo = h1?.querySelector('i')
      if logo? and h1?
        a = document.createElement('A')
        a.href = "http://www.imdb.com/title/tt0107614/"
        a.title = "Mrs. Doubtfire (1993)"
        lead = document.createElement('P')
        lead.appendChild(document.createTextNode('Happy April Fools Day!'))
        h1.classList.add 'aprilfools'
        h1.appendChild a
        h1.appendChild lead
        logo.style.backgroundImage = 'url("/assets/images/mrsdoubtfire.png")'
        logo.style.backgroundColor = 'inherit'

  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()

  if auth.isAuthenticated()
    redirectService.redirect "home", {}
  else
    $scope.signIn = ->
      auth.signIn api + "/auth",
        username: $scope.session.username
        password: $scope.session.password
        remember: $scope.session.remember_me
      , ->
        if $scope.session.remember_me
          localStorageService.set(userCookieName, currentUser)
          localStorageService.set(rememberDoubtfireCookie, true)
          localStorageService.set(doubtfireLoginTimeCookie, new Date().getTime())
        else
          localStorageService.remove(userCookieName)
          localStorageService.set(rememberDoubtfireCookie, false)
          localStorageService.remove(doubtfireLoginTimeCookie)
        redirectService.redirect "home", {}
      , (response) ->
        $scope.session.password = ''
        if response.error
          alertService.add("danger", "Login failed: " + response.error, 6000)
        else
          alertService.add("danger", "Login failed: Unable to connect to server", 6000)

).controller "SignOutCtrl", ($state, $timeout, auth, api, currentUser) ->
  if auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $timeout (-> $state.go "sign_in"), 750
  return this
