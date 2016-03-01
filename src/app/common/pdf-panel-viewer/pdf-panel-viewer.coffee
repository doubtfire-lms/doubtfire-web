angular.module("doubtfire.common.pdf-panel-viewer", [])
.directive('pdfPanelViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-panel-viewer/pdf-panel-viewer.tpl.html'
  scope:
    pdfUrl: '='
    footerText: '@'
    resourcesUrl: '='
    hideFooter: '=?'

  controller: ($scope, $sce, analyticsService) ->
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded #{type}"

    $scope.getGoogleDocsViewerUrl = ->
      $sce.trustAsResourceUrl "https://docs.google.com/gview?url=#{$scope.pdfUrl}&embedded=true"
)
