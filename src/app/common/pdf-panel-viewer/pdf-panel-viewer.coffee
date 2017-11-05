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

  controller: ($scope, analyticsService) ->
    $scope.showViewer = false
    
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded #{type}"
    # Watch the URL, and hide the view if it hasn't loaded
    $scope.$watch 'pdfUrl', (newUrl) ->
      $scope.showViewer = newUrl?
)
