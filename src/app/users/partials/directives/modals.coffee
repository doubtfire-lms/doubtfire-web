angular.module('doubtfire.users.partials.modals', [])

.controller('UserModalCtrl', ($scope, $modalInstance, alertService, User, user, users, isNew) ->
  $scope.user = user
  $scope.users = users
  
  $scope.isNew = isNew
  $scope.modalState = {}
  
  $scope.saveUser = ->
    if $scope.isNew
      # Todo - Alert Service not working... using alerts for now
      User.create( user: $scope.user ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          alertService.add("success", "User saved.", 2000)
          $scope.users.push(response)
      ),
      (
        (response) ->
          if response.data.error?
            alert response.data.error
            alertService.add("danger", "Error: " + response.data.error, 2000)
      )
    else
      User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
        (response) ->
          $modalInstance.close(response)
          alertService.add("success", "User saved.", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alert response.data.error
            alertService.add("danger", "Error: " + response.data.error, 2000)
      )
)