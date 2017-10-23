angular.module("doubtfire.common.pdf-viewer", [])
#
# Basic PDF viewer
#
.directive('pdfViewer', ->
  restrict: 'E'
  link: (scope, element, attrs) ->
    url = scope.$eval(attrs.pdfUrl)
    element.replaceWith("<object type='application/pdf' data='#{url}'></object>")
)
