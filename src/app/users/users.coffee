angular.module("doubtfire.users", [
  'doubtfire.users.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("admin/users#index",
    url: "/admin/users"
    views:
      main:
        controller: "AdminUsersCtrl"
        templateUrl: "users/admin.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"
    data:
      pageTitle: "_Users Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  )
)
.controller("AdminUsersCtrl", ($scope, $modal, User, alertService, csvResultService) ->
  $scope.file_data =
    onBatchUserSuccess: (response) ->
      csvResultService.show "User CSV import results", response
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
  $scope.showUserModal = (user) ->
    userToShow = if user?
      user
    else
      new User { }

    $modal.open
      templateUrl: 'users/partials/templates/user-modal-context.tpl.html'
      controller: 'UserModalCtrl'
      resolve:
        user: -> userToShow
        isNew: -> !user?
        users: -> $scope.users
)
