mod = angular.module("doubtfire.common.alert-list", [])
.directive('alertList', ->
  restrict: 'E'
  template: require('./alert-list.tpl.html')
  replace: true

  controller: ($scope) ->
)

module.exports = mod.name
