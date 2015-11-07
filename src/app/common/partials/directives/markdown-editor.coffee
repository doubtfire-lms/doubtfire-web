angular.module('doubtfire.common.markdown-editor', [])

.directive 'markdownEditor', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/markdown-editor.tpl.html'
  scope:
    markdownText: '=ngModel'
    height: '@'
  controller: ($scope) ->
    DEFAULT_HEIGHT = 300
    $scope.isEditing = true
    $scope.height = $scope.height or DEFAULT_HEIGHT
    $scope.codemirrorLoaded = (editor) ->
      editor.setSize("100%", $scope.height)
    $scope.heightStyle = ->
      "height:  #{$scope.height or DEFAULT_HEIGHT}px"
    $scope.editorOpts =
      lineWrapping : true
      mode: 'markdown'
      theme: 'xq-light'