angular.module('doubtfire.users', [
  'doubtfire.users.modals'
])

.config((headerStateProvider) ->
  userIndexStateData =
    url: "/admin/users"
    views:
      main:
        controller: "AdminUsersCtrl"
        templateUrl: "users/admin.tpl.html"
    data:
      pageTitle: "_Users Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  headerStateProvider.state "admin/users#index", userIndexStateData
)

.controller("AdminUsersCtrl", ($scope, $modal, User, alertService, CSVResultModal, UserSettingsModal) ->
  $scope.file_data =
    onBatchUserSuccess: (response) ->
      CSVResultModal.show "User CSV import results", response
      $scope.users = User.query()
    batchUserUrl: User.csvUrl()
    batchUserFiles: { file: { name: 'CSV File', type: 'csv' } }

  $scope.users = User.query()

  # Table sort details
  $scope.sortOrder = "id"

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # User settings/create modal
  $scope.showUserModal = (user) ->
    # If we're given a user, show that user, else create a new one
    userToShow = if user? then user else new User { }
    UserSettingsModal.show userToShow
)
