angular.module('doubtfire.common.content-editable', [])
# Workaround directive for lack of contenteditable support for divs and spans

.directive 'contenteditable', ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, element, attrs, ngModel) ->

      read = ->
        ngModel.$setViewValue element[0].innerText
        return

      ngModel.$render = ->
        element.html ngModel.$viewValue or ''
        return

      element.bind 'blur keyup change', ->
        scope.$apply read
        return
      return
  }