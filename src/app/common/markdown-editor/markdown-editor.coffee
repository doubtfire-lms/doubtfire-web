angular.module('doubtfire.common.markdown-editor', [])

.directive 'markdownEditor', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/markdown-editor.tpl.html'
  scope:
    markdownText: '=ngModel'
    height: '@'
    placeholder: '@'
    autofocus: "=?"
  controller: ($scope, $timeout) ->
    DEFAULT_HEIGHT = 300
    $scope.isEditing = true
    $scope.height = $scope.height or DEFAULT_HEIGHT
    $scope.codemirrorLoaded = (editor) ->
      editor.setSize("100%", $scope.height)
      if $scope.autofocus
        $timeout ->
          editor.focus()
          doc = editor.getDoc()
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