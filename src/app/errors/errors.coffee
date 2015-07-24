angular.module("doubtfire.errors", [
  "ui.router"
]).config(($stateProvider) ->

  $stateProvider.state("not_found",
    url: "/not_found"
    views:
      main:
        controller: "NotFoundCtrl"
        templateUrl: "errors/not_found.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Not Found_"
  ).state("unauthorised",
    url: "/unauthorised"
    views:
      main:
        controller: "UnauthorisedCtrl"
        templateUrl: "errors/unauthorised.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Unauthorised_"
  ).state("timeout",
    url: "/timeout?dest&params"
    views:
      main:
        controller: "TimeoutCtrl"
        templateUrl: "errors/timeout.tpl.html"
      header:
        controller: "ErrorHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Timeout_"
  )

)
.controller("TimeoutCtrl", ($scope, $timeout, api, auth, redirectService, currentUser) ->
  doRedirect = () ->
    redirectService.redirect "home", {}

  if auth.isAuthenticated()
    auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $timeout doRedirect, 2000
)
.controller("NotFoundCtrl", ($scope) ->)
.controller("UnauthorisedCtrl", ($scope) ->)