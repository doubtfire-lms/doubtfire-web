angular.module("doubtfire.sessions.auth", [
  "doubtfire.sessions.auth.http-auth-injector"
  "doubtfire.sessions.auth.roles"
])

#
# Authentication factory object for checking all auth
#
.factory("auth", ($http, $cookieStore, $timeout, usernameCookie, currentUser, authRoles, localStorageService, doubtfireLoginTimeCookie, rememberDoubtfireCredentialsCookie, DoubtfireConstants, $rootScope) ->

  defaultAnonymousUser = _.clone currentUser

  checkAuth = ->
    not _.isEqual currentUser, defaultAnonymousUser

  saveCurrentUser = ->
    localStorageService.set(usernameCookie, currentUser)
    $cookieStore.put usernameCookie, currentUser

  updateAuth = (authenticationUrl) ->
    if not checkAuth()
      return

    remember = localStorageService.get(rememberDoubtfireCredentialsCookie)
    localStorageService.set(doubtfireLoginTimeCookie, new Date().getTime())

    $http.put(authenticationUrl,
      username: currentUser.profile.username
      remember: remember
    ).success((response) ->
      currentUser.authenticationToken = response.auth_token
      saveCurrentUser()

      $timeout (( ) -> updateAuth "#{DoubtfireConstants.API_URL}/auth/#{currentUser.authenticationToken}.json"), 1000*60*60
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
        $cookieStore.remove usernameCookie
        localStorageService.remove usernameCookie
      return true
    else
      return false

  isValidRoleWhitelist = (roleWhitelist) ->
    _.difference(roleWhitelist, authRoles).length == 0

  if not tryChangeUser $cookieStore.get(usernameCookie)
    tryChangeUser localStorageService.get(usernameCookie)

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
        role: response.user.system_role
        profile: response.user

      $timeout (( ) -> updateAuth "#{DoubtfireConstants.API_URL}/auth/#{currentUser.authenticationToken}.json"), 1000*60*60

      if tryChangeUser user
        success()
      else
        error()
    ).error error

  auth.signOut = () ->
    if currentUser?.authenticationToken?
      $http.delete("#{DoubtfireConstants.API_URL}/auth/#{currentUser.authenticationToken}.json")

    tryChangeUser defaultAnonymousUser
    $rootScope.$broadcast "signOut"
    localStorageService.remove(usernameCookie)
    localStorageService.set(rememberDoubtfireCredentialsCookie, false)
    localStorageService.remove(doubtfireLoginTimeCookie)

  # If the user is logged in then check if we should update their token
  if checkAuth()
    nowTime = new Date().getTime()
    endTime = parseInt(localStorageService.get(doubtfireLoginTimeCookie), 10) + 1000*60*60
    delayTime = endTime - nowTime

    if delayTime < 100
      delayTime = 100

    $timeout (( ) -> updateAuth "#{DoubtfireConstants.API_URL}/auth/#{currentUser.authenticationToken}.json"), delayTime

  # Return the auth object
  auth
)
