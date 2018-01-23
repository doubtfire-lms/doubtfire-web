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
  controller: ($scope, $timeout) ->
    DEFAULT_HEIGHT = 300

    ACCEPTED_TYPES =
      image:
        extensions: ['png', 'bmp', 'jpeg', 'jpg']
        name:       'image'
        icon:       'fa-file-image-o'

    $scope.commentType = {TEXT : 0, AUDIO : 1, IMAGE : 2} # Enum for keeping track of comment type
    $scope.currentCommentType = $scope.commentType.TEXT # Current value of comment type

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


BigTest = ->
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

  # ========================================================
  # Sets up all the elements that will be used for recording
  initElements = ->
 
    isRecording = false
    localStream = undefined

    #Record button
    btnRecord.onclick = ->
      if !isRecording

        #function that performs the recoding tasks
        startRecording = ->
          tracks = streamRef.getTracks()[0]
          if !tracks.enabled
            tracks.enabled = true
          
          # Update buttons
          btnRecord.src = "/assets/icons/record_active.png"
          btnPlay.disabled = true
          btnPlay.classList.add("disabled")
          btnSend.disabled = true
          btnSend.classList.add("disabled")
        
          # Start recording
          mediaRecorderRef.start()

          isRecording = true
          audio.removeAttribute('src')
          console.log "Is Recording: " + isRecording

          # Show visualisation
          prepareVisualise streamRef, true
          startDrawing()
          return

        #Check if there is an active track, if there isnt then create one
        if !activeTrack
          initRecording()

        #set a timeout in order to give the callback function in initRecording time to set variables
        setTimeout startRecording, 10
      else
           
        # Update buttons
        btnRecord.src = "/assets/icons/record.png"
        btnPlay.disabled = false
        btnPlay.classList.remove("disabled")
        btnSend.disabled = false
        btnSend.classList.remove("disabled")

        # Stop recording audio
        mediaRecorderRef.stop()
        tracks = streamRef.getTracks()[0]
        tracks.enabled = false

        isRecording = false
        console.log "Is Recording: " + isRecording

        # Clear visualisation
        stopDrawing()
      return

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
      return

    # Send button
    btnSend.onclick = ->
      tracks = streamRef.getTracks()[0]
      tracks.stop()
      activeTrack = false
      # prepare audio for sending
      prepareRecordedAudio(dataRef)
      return

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
    #console.log "Start draw timer"
    return

  stopDrawing = ->
    clearInterval drawTimer
    clearGraph()
    #console.log "Stop draw timer"
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
    #console.log("[INFO] Inside prepare method");
    fetch(audioFileURL).then (result) ->
      result.blob().then (blob) ->
        size = blob.size
        type = blob.type
        console.log '[INFO] Inside Fetch\n Blob size : ' + size + '\n Blob type : ' + type
        fileReader = new FileReader
        fileReader.readAsDataURL blob
        fileReader.addEventListener 'loadend', ->
          console.log '[INFO] Reader result : ' + fileReader.result
          fileData = fileReader.result
          downloadMediaContent = new Blob([ fileData ], 'type': type)
          downloadLink = document.getElementById('btnSend')
          mediaUrl = window.URL.createObjectURL(downloadMediaContent)
          downloadLink.href = mediaUrl
          return
        return
      return

  #=============================================
  initRecording = ->

    if navigator.mediaDevices and navigator.mediaDevices.getUserMedia
      console.log 'getUserMedia supported.'
      navigator.getUserMedia {
        audio: true
        video: false
      }, ((stream) ->
        mediaRecorder = new MediaRecorder(stream)

        #set refs to be used in buttons
        mediaRecorderRef = mediaRecorder
        streamRef = stream

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
  return
  

