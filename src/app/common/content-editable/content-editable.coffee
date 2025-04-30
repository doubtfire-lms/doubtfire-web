angular.module('doubtfire.common.content-editable', [])
# Workaround directive for lack of contenteditable support for divs and spans

.directive 'contenteditable', ($sce) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, element, attrs, ngModel) ->

      read = ->
        ngModel.$setViewValue element[0].innerText
        return

      ngModel.$render = ->
        element.html $sce.getTrustedHtml(ngModel.$viewValue or '')
        return

      element.bind 'blur keyup change', ->
        scope.$evalAsync(read)
        return
  }
