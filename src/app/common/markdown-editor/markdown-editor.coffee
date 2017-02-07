angular.module('doubtfire.common.markdown-editor', [])

.directive 'markdownEditor', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/markdown-editor/markdown-editor.tpl.html'
  scope:
    markdownText: '=ngModel'
    height: '@?'
    placeholder: '@?'
    autofocus: "@?"
    focus: '=?'
    onEnter: '=?'
  controller: ($scope, $timeout) ->
    DEFAULT_HEIGHT = 300
    $scope.isEditing = true
    $scope.height = $scope.height or DEFAULT_HEIGHT
    $scope.codemirrorLoaded = (editor) ->
      $scope.editor = editor
      $scope.editor.setSize("100%", $scope.height)
    $scope.focus = ->
      $scope.editor.focus()
    $scope.heightStyle = -> "height: #{$scope.height}px"
    $scope.editorOpts =
      lineWrapping : true
      mode: 'markdown'
      theme: 'xq-light'
      placeholder: $scope.placeholder
      autofocus: $scope.autofocus
    if $scope.onEnter?
      $scope.editorOpts.extraKeys = {
        Enter: $scope.onEnter
      }
