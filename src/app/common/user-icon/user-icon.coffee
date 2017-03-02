#
# User icon via gravatar email address or user initials
#
angular.module('doubtfire.common.user-icon', [])
.directive('userIcon', ->
  restrict: 'E'
  replace: true
  scope:
    user: '=?'
  templateUrl: 'common/user-icon/user-icon.tpl.html'
  controller: ($scope, currentUser) ->
    $scope.user ?= currentUser.profile
    $scope.initials = (->
      initials = $scope.user.name.split(" ")
      ("#{initials[0][0]}#{initials[1][0]}").toUpperCase()
    )()
)
