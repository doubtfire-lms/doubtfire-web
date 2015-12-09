angular.module("doubtfire.common.pdf-panel-viewer", [])
.directive('pdfPanelViewer', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/pdf-panel-viewer.tpl.html'
  scope:
    pdfUrl: '='
    footerText: '@'
    resourcesUrl: '='
    hideFooter: '=?'

  controller: ($scope, $sce) ->
    $scope.getGoogleDocsViewerUrl = ->
      $sce.trustAsResourceUrl "https://docs.google.com/gview?url=#{$scope.pdfUrl}&embedded=true"
)