#
# Controllers and providers related to the header/nav bar
#
angular.module('doubtfire.common.header', [
  'doubtfire.common.header.unit-dropdown'
])
.controller("BasicHeaderCtrl", ($scope, $state, $rootScope, UserNotificationSettingsModal, CalendarModal, UserSettingsModal, currentUser, AboutDoubtfireModal, $transitions, $document, $filter) ->
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
  # Opens the webcal menu
  #
  $scope.openCalendar = ->
    CalendarModal.show()

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

  # Watch for state transitions and update the task details for the dropdown
  $transitions.onSuccess { to: '**' }, (trans) ->
    $scope.task = trans.to().data?.task

  $rootScope.$on 'UnitRoleChanged', updateSelectedUnit
  $rootScope.$on 'ProjectChanged', updateSelectedUnit
)
