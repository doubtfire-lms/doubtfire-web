angular.module("doubtfire.pdf-panel-viewer", [])
.directive('pdfPanelViewer', ->
  restrict: 'E'
  templateUrl: 'common/pdf-panel-viewer.tpl.html'
  scope:
    pdfUrl: '='
  controller: ($scope, $sce) ->
    $scope.getUrl = ->
      $sce.trustAsResourceUrl "http://docs.google.com/gview?url=#{$scope.pdfUrl}&embedded=true"
)