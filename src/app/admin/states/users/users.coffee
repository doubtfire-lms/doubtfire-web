angular.module('doubtfire.admin.states.users', [])

#
# Administration panel for all doubtfire users
#
.config((headerServiceProvider) ->
  usersAdminViewStateData =
    url: "/admin/users"
    views:
      main:
        controller: "AdministerUsersCtrl"
        templateUrl: "admin/states/users/users.tpl.html"
    data:
      pageTitle: "_Users Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  headerServiceProvider.state "admin/users", usersAdminViewStateData
)

.controller("AdministerUsersCtrl", ($scope, $modal, User, DoubtfireConstants, alertService, CsvResultModal, UserSettingsModal) ->
  $scope.file_data =
    onBatchUserSuccess: (response) ->
      CsvResultModal.show "User CSV import results", response
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

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  # User settings/create modal
  $scope.showUserModal = (user) ->
    # If we're given a user, show that user, else create a new one
    userToShow = if user? then user else new User { }
    UserSettingsModal.show userToShow
)
