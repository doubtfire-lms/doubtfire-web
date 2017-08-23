angular.module("doubtfire.common.pdf-viewer", [])
#
# Basic PDF viewer
#
.directive('pdfViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-viewer/pdf-viewer.tpl.html'
  scope:
    pdfUrl: '='
  controller: ($scope) ->
    # Watch the URL, and hide the view if it hasn't loaded
    $scope.$watch 'pdfUrl', (newUrl) ->
      return unless newUrl?
)
