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
    email: '=?'
  templateUrl: 'common/user-icon/user-icon.tpl.html'
  controller: ($scope, $http, currentUser, md5) ->
    $scope.user ?= currentUser.profile
    $scope.size ?= 100
    $scope.email ?= $scope.user.email
    
    $scope.userBackgroundStyle = (email) ->
      # Gravatar hash
      hash = if (email) then md5.createHash(email.trim().toLowerCase()) else md5.createHash('')
      backgroundUrl = "https://www.gravatar.com/avatar/#{hash}.png?default=blank&size=#{$scope.size}"
      "background-image: url('#{backgroundUrl}')"
    
    $scope.initials = (->
      initials = if ($scope.user && $scope.user.name) then $scope.user.name.split(" ") else "  "
      if initials.length > 1 then ("#{initials[0][0]}#{initials[1][0]}").toUpperCase() else "  "
    )()
)
