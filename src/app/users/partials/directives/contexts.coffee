angular.module('doubtfire.users.partials.contexts', [])
.directive('userListContext', ->
  restrict: 'E'
  templateUrl: 'users/partials/templates/user-list-context.tpl.html'
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
        templateUrl: 'users/partials/templates/user-modal-context.tpl.html'
        controller: 'UserModalCtrl'
        resolve:
          user: -> userToShow
          isNew: -> !user?
          users: -> $scope.users
)
.directive('importExportContext', ->
  restrict: 'E'
  templateUrl: 'users/partials/templates/import-export-context.tpl.html'
  controller: ($scope, $modal, UserCSV) ->
    $scope.fileToUpload = "N/A"
    
    $scope.requestExport = () ->
      UserCSV.downloadFile()
    $scope.requestImport = () ->
      UserCSV.create( file: $scope.fileToUpload ).$promise.then (
        (data) ->
          alert "Success! #{data}"
      )
)