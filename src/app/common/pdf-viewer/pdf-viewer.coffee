angular.module("doubtfire.common.pdf-viewer", [])
#
# Basic PDF viewer
#
.directive('pdfViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-viewer/pdf-viewer.tpl.html'
  scope:
    pdfUrl: '='
  controller: ($scope, $element) ->
)
