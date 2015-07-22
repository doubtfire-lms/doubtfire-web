angular.module('doubtfire.file-uploader', ['ngFileUpload'])

.directive 'fileUploader', ->
  replace: true
  restrict: 'E'
  templateUrl: 'common/partials/templates/file-uploader.tpl.html'
  scope:
    # Files map a key (file name to be uploaded) to a value (containing a
    # a display name, and the type of file that is to be accepted, where
    # type is one of [document, csv, archive, code, image]
    # E.g.:
    # { file0: { name: 'Silly Name Code', type: 'code'  },
    #   fileX: { name: 'Silly name Shot', type: 'image' } ... }
    files: "="
    # URL to where image is to be uploaded
    url: '@'
    # Other payload data to pass in the upload
    # E.g.:
    # { unit_id: 10, other: { key: data, with: [array, of, stuff] } ... }
    payload: "="
  controller: ($scope, $timeout) ->
    #
    # Accepted upload types with associated data
    #
    ACCEPTED_TYPES =
      document:
        extensions: ['pdf']
        icon:       'fa-file-pdf-o'
        name:       'PDF'
      csv:
        extensions: ['csv']
        icon:       'fa-file-excel-o'
        name:       'CSV'
      code:
        extensions: ['pas', 'cpp', 'c', 'cs', 'h', 'java']
        icon:       'fa-file-code-o'
        name:       'code'
      image:
        extensions: ['png', 'gif', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg']
        name:       'image'
        icon:       'fa-file-image-o'
      zip:
        extensions: ['zip', 'tar.gz', 'tar']
        name:       'archive'
        icon:       'fa-file-zip-o'

    #
    # Error handling; check if empty files
    #
    throw Error "No files provided to uploader" if $scope.files?.length is 0

    #
    # Files enqueued to be uploaded, dynamically returned from
    # reducing the uploadZone models down to their model values only
    #
    enqueuedFiles = ->
      (zone.model for zone in $scope.uploadZones)

    #
    # Whether or not clearEnqueuedFiles is enabled
    #
    $scope.clearEnqueuedFilesEnabled = ->
      not isUploading and enqueuedFiles().length isnt 0

    #
    # Clears all files enqueued
    #
    $scope.clearEnqueuedFiles = ->
      _.each $scope.uploadZones, (zone) ->
        # Reset each model to null
        zone.model = null

    #
    # When a file is dropped, if there has been rejected files
    # warn the user that that file is not okay
    #
    $scope.checkForError = (upload) ->
      if upload.rejects?.length > 0
        upload.display.error = yes
        upload.rejects = null
        $timeout (-> upload.display.error = no), 4000

    #
    # Whether or not drop is supported by this browser - assume
    # true initially, but the drop zone will alter this
    #
    $scope.dropSupported = true

    #
    # Data required for each upload zone
    #
    $scope.uploadZones = _.map $scope.files, (uploadData, uploadName) ->
      type = uploadData.type
      typeData = ACCEPTED_TYPES[type]
      # No typeData found?
      unless typeData?
        throw Error "Invalid type provided to File Uploader #{type}"
      zone =
        name:     uploadName
        model:    null
        accept:   "'." + typeData.extensions.join(', .') + "'"
        # Rejected files
        rejects:  null
        display:
          name:   uploadData.name
          # Font awesome supports PDF (from Document),
          # CSV, Code and Image icons
          icon:   typeData.icon
          type:   typeData.name
          # Whether or not a reject error is shown
          error:  false
      zone

    #
    # Is uploading
    #
    isUploading = false