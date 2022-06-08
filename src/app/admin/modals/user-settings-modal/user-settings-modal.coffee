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

.controller('UserSettingsModalCtrl', ($scope, $modalInstance, DoubtfireConstants, alertService, analyticsService, newUserService, user) ->
  $scope.user = user or newUserService.newEmptyUser
  $scope.isNew = user?.id is undefined

  $scope.currentUser = newUserService.currentUser

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  $scope.modalState = {}

  createNewUser = ->
    newUserService.create( user: $scope.user ).subscribe(
      {
        next: (response) ->
          $modalInstance.close(response)
        error: (response) ->
          alertService.reportError(response)
      }
    )

  updateExistingUser = ->
    newUserService.update( $scope.user ).subscribe(
      {
        next: (response) ->
          $modalInstance.close(response)
        error: (response) ->
          alertService.reportError(response)
      }
    )

  $scope.saveUser = ->
    if $scope.isNew
      createNewUser()
    else
      updateExistingUser()
)
