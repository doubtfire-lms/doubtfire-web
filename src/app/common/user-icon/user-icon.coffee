#
# User icon via gravatar email address or user initials
#
angular.module('doubtfire.common.user-icon', [])
.directive('userIcon', ->
  restrict: 'E'
  replace: true
  scope:
    user: '=?'
    size: '=?'
  templateUrl: 'common/user-icon/user-icon.tpl.html'
  controller: ($scope, $http, currentUser, md5) ->
    $scope.user ?= currentUser.profile
    $scope.size ?= 100
    # Gravatar hash
    hash = md5.createHash($scope.user.email.trim().toLowerCase())
    backgroundUrl = "https://www.gravatar.com/avatar/#{hash}.png?default=blank&size=#{$scope.size}"
    $scope.userBackgroundStyle = "background-image: url('#{backgroundUrl}')"
    $scope.initials = (->
      initials = $scope.user.name.split(" ")
      ("#{initials[0][0]}#{initials[1][0]}").toUpperCase()
    )()
)
