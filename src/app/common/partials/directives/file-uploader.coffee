angular.module('doubtfire.file-uploader', [])

.directive 'fileUploader', ->
  replace: true
  restrict: 'E'
  templateUrl: 'common/partials/templates/file-uploader.tpl.html'
  scope:
    # Files map a key (file name to be uploaded) to a value (containing a
    # a display name, and the type of file that is to be accepted, where
    # type is one of [document, csv, zip, code, image]
    # E.g.:
    # { file0: { name: 'Silly Name Code', type: 'code'  },
    #   fileX: { name: 'Silly name Shot', type: 'image' } ... }
    files: "="
    # URL to where image is to be uploaded
    uploadUrl: '@'
    # Other payload data to pass in the upload
    # E.g.:
    # { unit_id: 10, other: { key: data, with: [array, of, stuff] } ... }
    payload: "="
  controller: ($scope) ->
    #
    # Accepted upload types, key bound to types of accepted extensions
    #
    ACCEPTED_TYPES =
      document: ['pdf']
      csv:      ['csv']
      code:     ['pas', 'cpp', 'c', 'cs', 'h', 'java']
      image:    ['png', 'gif', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg']
      zip:      ['zip', 'tar.gz', 'tar']

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
      isUploading and enqueuedFiles().length isnt 0

    #
    # Clears all files enqueued
    #
    $scope.clearEnqueuedFiles = ->
      _.each $scope.uploadZones, (zone) ->
        # Reset each model to null
        zone.model = null

    #
    # Data required for each upload zone
    #
    $scope.uploadZones = _.map files, (fileName, type) ->
      unless type in _.keys ACCEPTED_TYPES
        throw Error "Invalid type provided to File Uploader #{type}"
      zone =
        fileName: fileName
        model:    null
        # Font awesome supports PDF (from Document), CSV, Code and Image icons
        icon:     if type is 'document' then 'pdf' else upload.type
        accept:   "'" + ACCEPTED_TYPES[type].join() + "'"
      zone