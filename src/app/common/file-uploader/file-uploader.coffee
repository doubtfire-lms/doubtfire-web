angular.module('doubtfire.common.file-uploader', ["ngFileUpload"])

.directive 'fileUploader', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/file-uploader/file-uploader.tpl.html'
  scope:
    # Files map a key (file name to be uploaded) to a value (containing a
    # a display name, and the type of file that is to be accepted, where
    # type is one of [document, csv, archive, code, image]
    # E.g.:
    # { file0: { name: 'Silly Name Code', type: 'code'  },
    #   fileX: { name: 'Silly name Shot', type: 'image' } ... }
    files: '='
    # URL to where image is to be uploaded
    url: '='
    # Optional HTTP method used to post data (defaults to POST)
    method: '@'
    # Other payload data to pass in the upload
    # E.g.:
    # { unit_id: 10, other: { key: data, with: [array, of, stuff] } ... }
    payload: '=?'
    # Optional function to notify just prior to upload, enables injection of payload for example
    onBeforeUpload: '=?'
    # Optional function to perform on success (with one response parameter)
    onSuccess: '=?'
    # Optional function to perform on failure (with one response parameter)
    onFailure: '=?'
    # Optional function to perform when the upload is successful and about
    # to go back into its default state
    onComplete: '=?'
    # This value is bound to whether or not the uploader is currently uploading
    isUploading: '=?'
    # This value is bound to whether or not the uploader is ready to upload
    isReady: '=?'
    # Shows the names of files to be uploaded (defaults to true)
    showName: '=?'
    # Shows initially as button
    asButton: '=?'
    # Exposed files that are in the zone
    filesSelected: '=?'
    # Whether we have one or many drop zones (default is false)
    singleDropZone: '=?'
    # Whether or not we show the upload button or do we hide it allowing an
    # external trigger to upload (default is true)
    showUploadButton: '=?'
    # Sets this scope variable to a function that can then be triggered externally
    # from outside the scope
    initiateUpload: '=?'
    # What happens when we click cancel on failure
    onClickFailureCancel: '=?'
    # Whether we should reset after upload
    resetAfterUpload: '=?'
  controller: ($scope, $timeout, newUserService) ->
    #
    # Accepted upload types with associated data
    #
    ACCEPTED_TYPES =
      document:
        extensions: ['pdf', 'ps']
        icon:       'fa-file-pdf-o'
        name:       'PDF'
      csv:
        extensions: ['csv','xls','xlsx']
        icon:       'fa-file-excel-o'
        name:       'CSV'
      code:
        extensions: ['pas', 'cpp', 'c', 'cs', 'csv', 'h', 'hpp', 'java', 'py', 'js', 'html', 'coffee', 'rb', 'css',
                    'scss', 'yaml', 'yml', 'xml', 'json', 'ts', 'r', 'rmd', 'rnw', 'rhtml', 'rpres', 'tex',
                    'vb', 'sql', 'txt', 'md', 'jack', 'hack', 'asm', 'hdl', 'tst', 'out', 'cmp', 'vm', 'sh', 'bat',
                    'dat', 'ipynb', 'pml', 'vue']
        icon:       'fa-file-code-o'
        name:       'code'
      image:
        extensions: ['png', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg', 'gif']
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
    # Whether or not clearEnqueuedFiles is enabled
    #
    $scope.clearEnqueuedUpload = (upload) ->
      upload.model = null
      refreshShownUploadZones()

    #
    # Default showName
    #
    $scope.showName ?= true

    #
    # Default singleDropZone
    #
    $scope.singleDropZone ?= false

    #
    # Default asButton
    #
    $scope.asButton ?= false

    #
    # Only initially show uploader if not presenting as button
    #
    $scope.showUploader = !$scope.asButton

    #
    # Default show upload button
    #
    $scope.showUploadButton ?= true

    #
    # Default resetAfterUpload to true
    #
    $scope.resetAfterUpload ?= true

    #
    # When a file is dropped, if there has been rejected files
    # warn the user that that file is not okay
    #
    checkForError = (upload) ->
      if upload.rejects?.length > 0
        upload.display.error = yes
        upload.rejects = null
        $timeout (-> upload.display.error = no), 4000
        return true
      false

    # Called when the model has changed
    $scope.modelChanged = (newFiles, upload) ->
      return unless newFiles.length > 0 || upload.rejects.length > 0
      gotError = checkForError(upload)
      unless gotError
        $scope.filesSelected = _.flatten(_.map($scope.uploadZones, 'model'))
        if $scope.singleDropZone
          $scope.selectedFiles = $scope.uploadZones
          refreshShownUploadZones()

    #
    # Will refresh which shown drop zones are shown
    # Only changes if showing one drop zone
    #
    refreshShownUploadZones = ->
      if $scope.singleDropZone
        # Find the first-most empty model in each zone
        firstEmptyZone = _.find($scope.uploadZones, (zone) -> !zone.model? || zone.model.length == 0)
        if firstEmptyZone?
          $scope.shownUploadZones = [firstEmptyZone]
        else
          $scope.shownUploadZones = []

    #
    # Whether or not drop is supported by this browser - assume
    # true initially, but the drop zone will alter this
    #
    $scope.dropSupported = true

    #
    # Data required for each upload zone
    #
    createUploadZones = (files) ->
      zones = _.map(files, (uploadData, uploadName) ->
        type = uploadData.type
        typeData = ACCEPTED_TYPES[type]
        # No typeData found?
        unless typeData?
          throw Error "Invalid type provided to File Uploader #{type}"
        zone =
          name:     uploadName
          model:    null
          accept:   "'." + typeData.extensions.join(',.') + "'"
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
      )
      # Remove all but the active drop zone
      if $scope.singleDropZone
        $scope.shownUploadZones = [_.first(zones)]
      else
        $scope.shownUploadZones = zones
      $scope.uploadZones = zones
    createUploadZones($scope.files)

    #
    # Watch for changes in the files, and recreate the zones when
    # they do change
    #
    $scope.$watch 'files', (files, oldFiles) ->
      createUploadZones(files)

    #
    # Checks if okay to upload (i.e., file models exist for each drop zone)
    #
    $scope.readyToUpload = ->
      $scope.isReady = _.compact(_.flatten (upload.model for upload in $scope.uploadZones)).length is _.keys($scope.files).length

    #
    # Resets the uploader and call it
    #
    $scope.resetUploader = ->
      # No upload info and we're not uploading
      $scope.uploadingInfo = null
      $scope.isUploading = false
      $scope.showUploader = !$scope.asButton
      for upload in $scope.uploadZones
        $scope.clearEnqueuedUpload(upload)
    $scope.resetUploader()

    #
    # Override on click failure cancel if not set to just reset uploader
    #
    $scope.onClickFailureCancel ?= $scope.resetUploader


    #
    # Initiates the upload
    #
    $scope.initiateUpload = ->
      return unless $scope.readyToUpload()
      $scope.onBeforeUpload?()

      xhr   = new XMLHttpRequest()
      form  = new FormData()
      # Append data
      files = ({ name: zone.name; data: zone.model[0] } for zone in $scope.uploadZones)
      form.append file.name, file.data for file in files
      # Append payload
      payload = ({ key: k; value: v } for k, v of $scope.payload)
      for payloadItem in payload
        payloadItem.value = JSON.stringify(payloadItem.value) if _.isObject payloadItem.value
        form.append payloadItem.key, payloadItem.value
      # Set the percent
      $scope.uploadingInfo =
        progress: 5
        success: null
        error: null
        complete: false
      $scope.isUploading = true
      # Callbacks
      xhr.onreadystatechange = ->
        if xhr.readyState is 4
          $timeout (->
            # Upload is now complete
            $scope.uploadingInfo.complete = true
            response = null
            try
              response = JSON.parse xhr.responseText
            catch e
              if xhr.status is 0
                response = { error: 'Could not connect to the Doubtfire server' }
              else
                response = xhr.responseText
            # Success (20x success range)
            if xhr.status >= 200 and xhr.status < 300
              $scope.onSuccess?(response)
              $scope.uploadingInfo.success = true
              $timeout((->
                $scope.onComplete?()
                if $scope.resetAfterUpload
                  $scope.resetUploader()
              ), 2500)
            # Fail
            else
              $scope.onFailure?(response)
              $scope.uploadingInfo.success = false
              $scope.uploadingInfo.error   = response.error or "Unknown error"
            $scope.$apply()
          ), 2000
      xhr.upload.onprogress = (event) ->
        $scope.uploadingInfo.progress = parseInt(100.0 * event.position / event.totalSize)
        $scope.$apply()
      # Default the method to POST if it was not defined
      $scope.method = 'POST' unless $scope.method?

      # Send it
      xhr.open $scope.method, $scope.url, true

      # Add auth details
      xhr.setRequestHeader('Auth-Token', newUserService.currentUser.authenticationToken)
      xhr.setRequestHeader('Username', newUserService.currentUser.username)

      xhr.send form
