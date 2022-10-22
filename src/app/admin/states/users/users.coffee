angular.module('doubtfire.admin.states.users', [])

#
# Administration panel for all doubtfire users
#
.config(($stateProvider) ->
  usersAdminViewStateData =
    url: "/admin/users"
    views:
      main:
        controller: "AdministerUsersCtrl"
        templateUrl: "admin/states/users/users.tpl.html"
    data:
      pageTitle: "_Users Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  $stateProvider.state "admin/users", usersAdminViewStateData
)

.controller("AdministerUsersCtrl", ($scope, $modal, DoubtfireConstants, alertService, CsvResultModal, fileDownloaderService, GlobalStateService, newUserService, EditProfileService) ->
  # We are not showing a particlar unit or project
  GlobalStateService.setView("OTHER")

  $scope.fileData =
    onBatchUserSuccess: (response) ->
      CsvResultModal.show "User CSV import results", response
      $scope.users = newUserService.query(undefined)
    batchUserUrl: newUserService.csvUrl
    batchUserFiles: { file: { name: 'CSV File', type: 'csv' } }

  newUserService.query().subscribe(
    {
      next: (response) ->
        $scope.users = response
      error: (response) ->
        if response.error.error?
          alertService.add("danger", "Error: " + response.error.error, 6000)
    }
  )

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
    userToShow = if user? then user else newUserService.createInstanceFrom { }
    EditProfileService.openDialog(userToShow)

  $scope.downloadUsersCSV = () ->
    fileDownloaderService.downloadFile(newUserService.csvUrl, "Users.csv")
)
