angular.module('doubtfire.admin.states.campuses', [])

#
# Users with an Administrator system role can create new Teaching Periods.
#
.config((headerServiceProvider) ->
  campusesAdminViewStateData =
    url: "/admin/campuses"
    views:
      main:
        controller: "CampusState"
        templateUrl: "admin/states/campuses/campus-list/campus-list.tpl.html"
    data:
      pageTitle: "_Campus Administration_"
      roleWhitelist: ['Admin']
  headerServiceProvider.state "admin/campuses", campusesAdminViewStateData
)
.controller("CampusState", ($scope, $state, $modal, DoubtfireConstants, currentUser, alertService) ->

  $scope.campuses = {loadedCampuses: [ { name: 'Dank Campus', mode: 'The Dank Mode' }, { name: 'Meme Campus', mode: 'Memes for Dreams' }, ]}

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName
)
