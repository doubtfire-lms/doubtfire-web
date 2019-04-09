#
# Controllers and providers related to the header/nav bar
#
angular.module('doubtfire.common.header', [
  'doubtfire.common.header.unit-dropdown'
])
.controller("BasicHeaderCtrl", ($scope, $state, $rootScope, $modal, AboutDoubtfireModal, UserNotificationSettingsModal, UserSettingsModal, currentUser, $stateParams) ->
  $scope.currentUser = currentUser.profile

  $scope.tutor = $state.params?.tutor?

  #
  # Opens the user settings modal
  #
  $scope.openUserSettings = ->
    UserSettingsModal.show $scope.currentUser

  #
  # Opens the notification settings modal
  #
  $scope.openNotificationSettings = ->
    UserNotificationSettingsModal.show $scope.currentUser

  #
  # Opens the about DF modal
  #
  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()

  #
  # Updates the context of the selected unit
  #
  updateSelectedUnit = (event, data) ->
    context = data.context
    return unless context?
    $scope.unit =
      code: context.unit_code || context.unit().code
      name: context.unit_name || context.unit().name
    $scope[if context.role? then "unitRole" else "project"] = context

  $scope.task = $state.current.data.task

  $rootScope.$on '$stateChangeSuccess', (event, toState) ->
    $scope.task = toState.data.task
  $rootScope.$on 'UnitRoleChanged', updateSelectedUnit
  $rootScope.$on 'ProjectChanged', updateSelectedUnit
)
