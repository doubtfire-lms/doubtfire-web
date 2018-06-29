angular.module('doubtfire.common.markdown-editor', [])

.directive 'markdownEditor', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/markdown-editor/markdown-editor.tpl.html'
  scope:
    height: '@?'
    placeholder: '@?'
    autofocus: "@?"
    focus: '=?'
    # onEnter: '=?'
    files: '='
    url: '='
    isUploading: '=?'
    isReady: '=?'
    showName: '=?'
    # Exposed files that are in the zone
    filesSelected: '=?'
    # Whether we have one or many drop zones (default is false)
    singleDropZone: '=?'
    showUploadButton: '=?'
    initiateUpload: '=?'
  controller: ($scope, $timeout, CommentResourceService, taskService) ->
    DEFAULT_HEIGHT = 300

    ACCEPTED_TYPES =
      image:
        extensions: ['png', 'bmp', 'jpeg', 'jpg']
        name:       'image'
        icon:       'fa-file-image-o'

    $scope.commentType = {TEXT : "text", AUDIO : "audio", IMAGE : "image"} # Enum for keeping track of comment type
    $scope.currentCommentType = $scope.commentType.TEXT # Current value of comment type

    $scope.$watch 'currentCommentType', ->
      CommentResourceService.setCommentType($scope.currentCommentType)

    $scope.isEditing = true
    $scope.height = $scope.height or DEFAULT_HEIGHT
    # $scope.codemirrorLoaded = (editor) ->
    #   $scope.editor = editor
    #   $scope.editor.setSize("100%", $scope.height)
    $scope.focus = ->
      $scope.editor.focus()
    $scope.heightStyle = -> "height: #{$scope.height}px"
    # $scope.editorOpts =
    #   lineWrapping : true
    #   mode: 'markdown'
    #   theme: 'xq-light'
    #   placeholder: $scope.placeholder
    #   autofocus: $scope.autofocus
    # if $scope.onEnter?
    #   $scope.editorOpts.extraKeys = {
    #     Enter: $scope.onEnter
    #   }

    #============================================================================
    # This function formats the name of the image
    # It limits the length of the name to be 20 characters and always displays the type
    # $scope.formatImageName = (imageName) ->
    #   index = imageName.indexOf(".")
    #   nameString = imageName.substring(0,index)
    #   typeString = imageName.substring(index)

    #   if nameString.length > 20
    #     nameString = nameString.substring(0,20) + ".."

    #   finalString = nameString + typeString
    #   finalString

    # #============================================================================
    # $scope.clearEnqueuedUpload = (upload) ->
    #   upload.model = null
    #   refreshShownUploadZones()

    # #============================================================================
    # # Upload image files as comments to a given task
    # $scope.postImageComment = ->
    #   taskService.addMediaComment(CommentResourceService.task, $scope.upload.model, "image")
    #   $scope.clearEnqueuedUpload($scope.upload)

    # #============================================================================
    # # Will refresh which shown drop zones are shown
    # # Only changes if showing one drop zone
    # refreshShownUploadZones = ->
    #   if $scope.singleDropZone
    #     # Find the first-most empty model in each zone
    #     firstEmptyZone = _.find($scope.uploadZones, (zone) -> !zone.model? || zone.model.length == 0)
    #     if firstEmptyZone?
    #       $scope.shownUploadZones = [firstEmptyZone]
    #     else
    #       $scope.shownUploadZones = []

    #============================================================================
    $scope.hasBeenSetup = false
