angular.module('doubtfire.common.markdown-editor', [])

.directive 'markdownEditor', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/markdown-editor/markdown-editor.tpl.html'
  scope:
    markdownText: '=ngModel'
    height: '@'
    placeholder: '@'
    autofocus: "=?"
    focus: '=?'
  controller: ($scope, $timeout) ->
    DEFAULT_HEIGHT = 300
    $scope.isEditing = true
    $scope.height = $scope.height or DEFAULT_HEIGHT
    $scope.codemirrorLoaded = (editor) ->
      $scope.editor = editor
      $scope.editor.setSize("100%", $scope.height)
      focusEditor() if $scope.autofocus
    $scope.focus = focusEditor = ->
      $timeout ->
        $scope.editor.focus()
        doc = $scope.editor.getDoc()
        doc.setValue($scope.markdownText) if $scope.markdownText?.length > 0
        lineCount = doc.lineCount()
        lastChar = doc.getLine(lineCount - 1).length
        doc.setCursor({line: lineCount, ch: lastChar})
    $scope.heightStyle = ->
      "height:  #{$scope.height or DEFAULT_HEIGHT}px"
    $scope.editorOpts =
      lineWrapping : true
      mode: 'markdown'
      theme: 'xq-light'
      placeholder: $scope.placeholder
