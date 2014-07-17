angular.module('doubtfire.users.partials.modals', [])

.controller('UserModalCtrl', ($scope, $modalInstance, alertService, currentUser, User, user, users, isNew) ->
  $scope.user = user
  $scope.users = users
  $scope.currentUser = currentUser
  
  $scope.isNew = isNew
  $scope.modalState = {}
  
  $scope.saveUser = ->
    if $scope.isNew
      $scope.user.username = $scope.user.first_name
      User.create( user: $scope.user ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          $scope.users.push(response)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 2000)
      )
    else
      User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 2000)
      )
)