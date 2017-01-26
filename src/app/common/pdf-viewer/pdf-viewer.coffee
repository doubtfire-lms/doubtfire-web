angular.module("doubtfire.common.pdf-viewer", [])
#
# Basic PDF viewer
#
.directive('pdfViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-viewer/pdf-viewer.tpl.html'
  scope:
    pdfUrl: '='
  controller: ($scope, $sce, $timeout) ->
    $scope.isSafari = navigator.userAgent.indexOf("Safari") > 0 && navigator.userAgent.indexOf("Chrome") == -1
    # Watch the URL, and hide the view if it hasn't loaded
    $scope.$watch 'pdfUrl', (newUrl) ->
      return unless newUrl?
      $scope.shouldShowIframe = false
      # Add a timeout to reset the iframe
      $timeout (nowLoading) ->
        $scope.shouldShowIframe = true
      $scope.googleDocsUrl = $sce.trustAsResourceUrl "https://docs.google.com/gview?url=#{newUrl}&embedded=true"
)
