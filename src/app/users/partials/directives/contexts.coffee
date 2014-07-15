angular.module('doubtfire.users.partials.contexts', [])
.directive('userList', ->
  restrict: 'E'
  templateUrl: 'users/partials/templates/user-list.tpl.html'
  controller: ($scope, $modal, User) ->
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
        templateUrl: 'users/partials/templates/user-modal.tpl.html'
        controller: 'UserModalCtrl'
        resolve:
          user: -> userToShow
          isNew: -> !user?
          users: -> $scope.users
)
.directive('importExport', ->
  restrict: 'E'
  templateUrl: 'users/partials/templates/import-export.tpl.html'
  controller: ($scope, $modal, User) ->
    # todo write...
)