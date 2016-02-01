angular.module('doubtfire.users.partials.modals', [])

.controller('UserModalCtrl', ($scope, $modalInstance, alertService, analyticsService, currentUser, User, user, users, isNew, auth) ->
  $scope.user = user
  $scope.users = users
  $scope.currentUser = currentUser

  $scope.isNew = isNew
  $scope.modalState = {}

  $scope.saveUser = ->
    if $scope.isNew
      User.create( user: $scope.user ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          if $scope.users
            $scope.users.push(response)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          user.name = user.first_name + " " + user.last_name
          if user == currentUser.profile
            auth.saveCurrentUser()
            analyticsService.event "Doubtfire Analytics", "User opted in research" if $scope.user.opt_in_to_research
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
)
.controller('UserNotificationSettingsModalCtrl', ($scope, $modalInstance, alertService, currentUser, User, user, auth) ->
  $scope.user = user
  $scope.currentUser = currentUser
  $scope.modalState = {}

  $scope.saveNotifications = ->
    User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
      (response) ->
        $modalInstance.close(response)
        user.name = user.first_name + " " + user.last_name
        if user == currentUser.profile
          auth.saveCurrentUser()
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )
)
