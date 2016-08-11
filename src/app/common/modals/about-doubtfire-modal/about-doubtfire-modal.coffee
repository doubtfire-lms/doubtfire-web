_ = require('lodash')

#
# Modal to show Doubtfire version info
#
mod = angular.module("doubtfire.common.modals.about-doubtfire-modal", [])

.factory("AboutDoubtfireModal", ($modal) ->
  AboutDoubtfireModal = {}

  AboutDoubtfireModal.show = ->
    $modal.open
      template: require('./about-doubtfire-modal.tpl.html')
      controller: 'AboutDoubtfireModalCtrl'
      size: 'lg'

  AboutDoubtfireModal
)

.controller('AboutDoubtfireModalCtrl', ($scope, DoubtfireContributors, $modalInstance, $http, $q) ->
  contributors = DoubtfireContributors
  # initial data
  $scope.contributors = _.map contributors, (c) ->
    avatar:   require('./assets/images/person-unknown.gif')
    handler:  c
  $scope.close = ->
    $modalInstance.dismiss()
  for handler, index in contributors
    do (handler, index) ->
      $http.get("https://api.github.com/users/#{handler}").then (response) ->
        data = response.data
        if data.blog
          data.blog = 'http://' + data.blog unless data.blog.match /^[a-zA-Z]+:\/\//
        $scope.contributors[index] =
          name:     data.name
          avatar:   data.avatar_url or '/assets/images/person-unknown.gif'
          website:  data.blog or data.html_url
          github:   data.html_url
          handler:  handler
)

module.exports = mod.name
