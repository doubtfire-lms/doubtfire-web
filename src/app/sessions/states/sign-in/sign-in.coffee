angular.module("doubtfire.sessions.states.sign-in", [])

#
# State for sign in
#
.config(($stateProvider) ->
  signInStateData =
    url: "/sign_in?dest&params&authToken&username"
    views:
      main:
        controller: "SignInCtrl"
        templateUrl: "sessions/states/sign-in/sign-in.tpl.html"
    data:
      pageTitle: "_Sign In_"

  $stateProvider.state "sign_in", signInStateData
)

.controller("SignInCtrl", ($scope, $state, $stateParams, DoubtfireConstants, $timeout, $http, $modal, alertService, localStorageService, AboutDoubtfireModal, GlobalStateService, newUserService, authenticationService) ->
  GlobalStateService.setView("OTHER")
  GlobalStateService.hideHeader() # we aren't logged in yet...
  isIE = ->
    window.navigator.appName is "Microsoft Internet Explorer"
  ieVersion = ->
    matches = new RegExp(" MSIE ([0-9].[0-9]);").exec(window.navigator.userAgent)
    return parseInt(matches[1].replace(".0", "")) if matches? and matches.length > 1
    true

  $scope.isIE = isIE() and ieVersion() < 11 # Support IE11

  $scope.session = { remember_me: true }

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  # Check for SSO login
  $scope.api = DoubtfireConstants.API_URL
  timeoutPromise = $timeout (-> $scope.waitingAWhile = true), 1500
  $http.get("#{DoubtfireConstants.API_URL}/auth/method").then ((response) ->

    $scope.SSOLoginUrl = response.data.redirect_to || false

    if $scope.SSOLoginUrl
      if $stateParams.authToken
        # This is SSO and we just got an auth_token? Must request to sign in
        $scope.signIn({ auth_token: $stateParams.authToken, username: $stateParams.username })
      else
        # We are SSO and no auth token so we can must redirect to SSO login provider
        window.location.assign($scope.SSOLoginUrl)
    else
      $scope.authMethodLoaded = true
      $timeout.cancel(timeoutPromise)
    ), ((err) ->
      $scope.authMethodFailed = true
      $scope.error = err
      $timeout.cancel(timeoutPromise)
    )

  # April Fools Easter Egg :-)
  angular.element(document).ready ->
    # This would make absolutely no sense unless the external name is Doubtfire!
    return if DoubtfireConstants.ExternalName.value isnt 'Doubtfire'
    today = new Date()
    aprilFools =  today.getDate()   is 1 and # first day of the
                  today.getMonth()  is 3     # fourth month (April - zero-based)
    if aprilFools
      h1   = document.querySelector('#sign-in h1.logo')
      logo = h1?.querySelector('i')
      if logo? and h1?
        a = document.createElement('A')
        a.href = "http://www.imdb.com/title/tt0107614/"
        a.title = "Mrs. Doubtfire (1993)"
        lead = document.createElement('P')
        lead.appendChild(document.createTextNode('Happy April Fools Day! 🎉'))
        h1.classList.add 'aprilfools'
        h1.appendChild a
        h1.appendChild lead
        logo.style.backgroundImage = 'url("/assets/images/mrsdoubtfire.png")'
        logo.style.backgroundColor = 'inherit'

  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()

  if authenticationService.isAuthenticated()
    $state.go "home"
    GlobalStateService.showHeader()
  else
    $scope.signIn = (signInCredentials) ->
      $scope.signingIn = true
      signInFunc = ->
        authenticationService.signIn(
          $scope.session.username,
          $scope.session.password,
          $scope.session.remember_me,
          (response) ->
            alertService.clearAll()
            $state.go "home", {}
          (response) ->
            $scope.session.password = ''
            $scope.signingIn = false
            if response.error
              $scope.invalidCredentials = true
              resetInvalidCreds = ->
                $scope.invalidCredentials = false
              $timeout resetInvalidCreds, 300
              alertService.add("warning", "Login failed: " + response.error, 6000)
            else
              alertService.add("danger", "Login failed: Unable to connect to server", 6000)
        )
      $timeout signInFunc, 100
)
