angular.module("utilService", [])

.filter "fromNow", ->
  return (date) ->
    return moment(new Date(date)).fromNow()

.filter "titleize", ->
  (input) -> _.titleize input

.filter "humanize", ->
  (input) -> _.humanize input

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
