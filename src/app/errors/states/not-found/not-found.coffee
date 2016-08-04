#
# Define the not found state
#
mod = angular.module("doubtfire.errors.states.not-found", [])

.config((headerServiceProvider) ->
  stateData =
    url: "/not_found"
    views:
      main:
        controller: "NotFoundCtrl"
        template: require('./not-found.tpl.html')
    data:
      pageTitle: "_Not Found_"
  headerServiceProvider.state 'not_found', stateData
)

.controller("NotFoundCtrl", ($scope) ->)

module.exports = mod.name
