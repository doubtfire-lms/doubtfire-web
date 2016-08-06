#
# Removes an element if the current user's authenticated role is
# not present in the whitelist
#
_ = require('lodash')

mod = angular.module("doubtfire.sessions.auth.roles.if-role", [])

.directive("ifRole", (auth) ->
  restrict: "A"
  link: (scope, element, attrs) ->
    roleWhitelist = _.string.words(attrs.ifRole)
    element.remove() if not auth.isAuthorised roleWhitelist

)

module.exports = mod.name
