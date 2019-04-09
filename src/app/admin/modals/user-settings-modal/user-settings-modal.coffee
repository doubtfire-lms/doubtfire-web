angular.module('doubtfire.admin.modals.user-settings-modal', [])

.factory('UserSettingsModal', ($modal) ->
  UserSettingsModal = {}

  UserSettingsModal.show = (user) ->
    $modal.open
      templateUrl: 'admin/modals/user-settings-modal/user-settings-modal.tpl.html'
      controller: 'UserSettingsModalCtrl'
      resolve:
        user: -> user

  UserSettingsModal
)

.controller('UserSettingsModalCtrl', ($scope, $modalInstance, DoubtfireConstants, alertService, analyticsService, currentUser, User, user, auth) ->
  $scope.user = user or new User { }
  $scope.isNew = user?.id is undefined

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  if $scope.isNew
    $scope.users = User.query()

  $scope.currentUser = currentUser

  $scope.modalState = {}

  createNewUser = ->
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

  updateExistingUser = ->
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

  $scope.saveUser = ->
    if $scope.isNew
      createNewUser()
    else
      updateExistingUser()
)
