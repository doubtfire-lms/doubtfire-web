angular.module("doubtfire.common.pdf-panel-viewer", [])
.directive('pdfPanelViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-panel-viewer/pdf-panel-viewer.tpl.html'
  replace: true
  scope:
    pdfUrl: '='
    footerText: '@'
    resourcesUrl: '='
    hideFooter: '=?'

  controller: ($scope, $sce, $timeout, analyticsService) ->
    $scope.isSafari = navigator.userAgent.indexOf("Safari") > 0 && navigator.userAgent.indexOf("Chrome") == -1
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded #{type}"

    $scope.shouldShowIframe = true

    # Watch the URL, and hide the view if it hasn't loaded
    $scope.$watch 'pdfUrl', (newUrl) ->
      return unless newUrl?
      $scope.shouldShowIframe = false
      # Add a timeout to reset the iframe
      $timeout (nowLoading) ->
        $scope.shouldShowIframe = true
      $scope.googleDocsUrl = $sce.trustAsResourceUrl "https://docs.google.com/gview?url=#{newUrl}&embedded=true"
)
