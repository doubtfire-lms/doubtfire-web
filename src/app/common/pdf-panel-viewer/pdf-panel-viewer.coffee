mod = angular.module("doubtfire.common.pdf-panel-viewer", [])
.directive('pdfPanelViewer', ->
  restrict: 'E'
  template: require('./pdf-panel-viewer.tpl.html')
  replace: true
  scope:
    pdfUrl: '='
    footerText: '@'
    resourcesUrl: '='
    hideFooter: '=?'

  controller: ($scope, $sce, $timeout, analyticsService) ->
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

module.exports = mod.name
