angular.module("doubtfire.sessions.auth.roles.if-role", [])
#
# Removes an element if the current user's authenticated role is
# not present in the whitelist
#
.directive("ifRole", (auth) ->
  restrict: "A"
  link: (scope, element, attrs) ->
    roleWhitelist = _.words(attrs.ifRole)
    element.remove() if not auth.isAuthorised roleWhitelist

)
