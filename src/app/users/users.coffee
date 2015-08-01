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
.controller("AdminUsersCtrl", ($scope, $modal, User, alertService) ->
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

  $scope.batchUserUrl = User.csvUrl()
  $scope.batchUserFiles = { file: { name: 'CSV File', type: 'csv' } }
  $scope.onBatchUserSuccess = (response) ->
    if response.length != 0
      alertService.add("success", "Added #{response.length} users.", 2000)
      $scope.users = $scope.users.concat(response)
    else
      alertService.add("info", "No users need to be added.", 4000)

)
