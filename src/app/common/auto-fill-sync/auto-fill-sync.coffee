_ = require('lodash')

mod = angular.module("doubtfire.common.auto-fill-sync", [])

.directive "autoFillSync", ($timeout) ->
  # A directive to ensure browser form auto-fill works, since Angular doesn't support it.
  # See: http://stackoverflow.com/a/14966711
  require: "ngModel"
  link: (scope, elem, attrs, ngModel) ->
    origVal = elem.val()
    $timeout (->
      newVal = elem.val()
      ngModel.$setViewValue newVal if ngModel.$pristine and origVal isnt newVal
    ), 500

module.exports = mod.name
