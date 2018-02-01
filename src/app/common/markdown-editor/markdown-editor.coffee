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
  controller: ($scope, $rootScope, $timeout, taskService) ->
    DEFAULT_HEIGHT = 300

    ACCEPTED_TYPES =
      image:
        extensions: ['png', 'bmp', 'jpeg', 'jpg']
        name:       'image'
        icon:       'fa-file-image-o'

    $scope.commentType = {TEXT : "text", AUDIO : "audio", IMAGE : "image"} # Enum for keeping track of comment type
    $scope.currentCommentType = $scope.commentType.TEXT # Current value of comment type

    $scope.$watch 'currentCommentType', ->
      $rootScope.commentTypeValue = $scope.currentCommentType
      
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

    #
    # Upload image files as comments to a given task
    #
    $scope.postImageComment = ->
      console.log 'File Name : ' + $scope.upload.model[0].name
      taskService.addMediaComment($rootScope.currentTask, $scope.upload.model, $scope.currentCommentType)
      $scope.clearEnqueuedUpload($scope.upload)


    $scope.clearEnqueuedUpload = (upload) ->
      upload.model = null
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

    $scope.audioSetup = ->
    
      # Support multiple browsers
      navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia

      audioURL = undefined

      streamRef = undefined
      mediaRecorderRef = undefined
      dataRef = undefined

      activeTrack = false
      
      # Track the visualiser
      isPlaying = false
      
      btnRecord = document.getElementById('btnRecord')
      btnPlay = document.getElementById('btnPlay')
      btnSend = document.getElementById('btnSend')
      btnDelete = document.getElementById('btnDelete')
      canvas = document.getElementById('audio-visualiser')
      audio = document.getElementById('audioPlayer')

      audioCtx = new ((window.AudioContext or webkitAudioContext))
      canvasCtx = canvas.getContext('2d')

      # Needed for audio visualise
      audioSource = audioCtx.createMediaElementSource(audio)

      # ==============================================================================================================
      # Sets up all the elements that will be used for recording
      initElements = ->

        isRecording = false
        localStream = undefined

        #Record button
        btnRecord.onclick = ->
          if !isRecording

            streamRef.getTracks()[0].enabled = true

            # Update buttons
            btnRecord.src = "/assets/icons/record_active.png"
            btnPlay.disabled = true
            btnSend.disabled = true
          
            # Start recording
            mediaRecorderRef.start()

            isRecording = true
            audio.removeAttribute('src')
            console.log "Is Recording: " + isRecording

            # Show visualisation
            prepareVisualise streamRef, true
            startDrawing()
          else
              
            # Update buttons
            btnRecord.src = "/assets/icons/record.png"
            btnPlay.disabled = false
            #btnPlay.classList.remove("disabled")
            btnSend.disabled = false
            #btnSend.classList.remove("disabled")

            # Stop recording audio
            mediaRecorderRef.stop()
            streamRef.getTracks()[0].enabled = false

            isRecording = false
            console.log "Is Recording: " + isRecording

            # Clear visualisation
            stopDrawing()
          return false

        # Play button
        btnPlay.onclick = ->
          if isPlaying
            audio.pause()
            audio.currentTime = 0
            stopDrawing()
          else
            # fixed volume as it would increase on pause for some reason
            audio.volume = 0.75
            audio.play()
            startDrawing()
          return false

        # Send button
        btnSend.onclick = ->
          streamRef.getTracks()[0].enabled = false
          # prepare audio for sending
          prepareRecordedAudio(dataRef)
          return false

        audio.onplay = ->
          btnPlay.src = "/assets/icons/stop.png"
          isPlaying = true
          return

        audio.onended = ->
          btnPlay.src = "/assets/icons/play.png"
          isPlaying = false
          stopDrawing()
          return

        audio.onpause = ->
          btnPlay.src = "/assets/icons/play.png"
          isPlaying = false
          stopDrawing()
          return

        return

      ### =====================================================================
      * Visualise audio
      * Takes input (either stream or audio)
      ###

      #Draw timer
      drawTimer = undefined

      startDrawing = ->
        clearInterval drawTimer
        clearGraph()
        drawTimer = setInterval draw, 0.1
        return

      stopDrawing = ->
        clearInterval drawTimer
        clearGraph()
        return

      clearGraph = ->
        canvasCtx.clearRect 0, 0, canvas.width, canvas.height
        return

      source = undefined
      analyser = undefined
      bufferLength = undefined
      dataArray = undefined

      draw = ->
        analyser.getByteTimeDomainData dataArray
        analyser.getByteFrequencyData dataArray
        canvasCtx.fillstyle = '#000000'
        bars = 200
        clearGraph()
        i = 0
        while i < bars
          bar_x = i * 3
          bar_width = 2
          bar_height = -(dataArray[i] / 4) + 1
          canvasCtx.fillRect bar_x, canvas.height / 2, bar_width, bar_height
          canvasCtx.fillRect bar_x, canvas.height / 2 - bar_height, bar_width, bar_height
          i++
        return

      prepareVisualise = (input, isStream) ->
        if isStream
          source = audioCtx.createMediaStreamSource(input)
        else
          source = audioSource

        # Initialise analyser
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
        source.connect analyser
        if !isStream
          analyser.connect audioCtx.destination
        
        return

      # =====================================================================

      prepareRecordedAudio = (data) ->
        audioFileURL = window.URL.createObjectURL(data)
        fetch(audioFileURL).then (result) ->
          result.blob().then (blob) ->
            size = blob.size
            type = blob.type
            console.log '[INFO] Inside Fetch\n Blob size : ' + size + '\n Blob type : ' + type
            
            fileReader = new FileReader
            fileReader.readAsDataURL blob
            fileReader.addEventListener 'loadend', ->
              fileData = fileReader.result
              downloadMediaContent = new Blob([ fileData ], 'type': type)
              downloadLink = document.getElementById('btnSend')
              mediaUrl = window.URL.createObjectURL(downloadMediaContent)
              downloadLink.href = mediaUrl
              taskService.addMediaComment($rootScope.currentTask, mediaUrl, $scope.currentCommentType)
              return
            return
          return

      #=============================================
      initRecording = ->

        if navigator.mediaDevices and navigator.mediaDevices.getUserMedia
          console.log 'getUserMedia supported.'
          navigator.getUserMedia {
            audio: true
          }, ((stream) ->
            mediaRecorder = new MediaRecorder(stream)

            #set refs to be used in buttons
            mediaRecorderRef = mediaRecorder
            streamRef = stream
            streamRef.getTracks()[0].enabled = false

            mediaRecorder.ondataavailable = (e) ->
              data = e.data
              audioURL = window.URL.createObjectURL(data)
              audio.src = audioURL

              #set ref to be used in buttons
              dataRef = data
            
              prepareVisualise audio, false
              return

          ), (err) ->
            console.log 'The following gUM error occured: ' + err
          return
        else
          console.log 'getUserMedia is not supported on your browser!'

        return

      #=============================================


      initElements()
      initRecording()
      return
    

