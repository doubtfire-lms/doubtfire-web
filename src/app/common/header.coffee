angular.module("doubtfire.header", [ 'ui.bootstrap' ])

.factory("headerService", ->

  links_data = [ ]

  links: () -> links_data
  clearLinks: ->
    links_data.length = 0
  setLinks: (new_links) ->
    links_data.length = 0
    links_data.push link for link in new_links
)

.controller("BasicHeaderCtrl", ($scope, $state, currentUser, headerService) ->
  $scope.name = currentUser.profile.name
  $scope.nickname = currentUser.profile.nickname

  $scope.links = headerService.links()
)