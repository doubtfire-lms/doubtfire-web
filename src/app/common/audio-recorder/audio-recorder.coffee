angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, mediaService) ->

    constraints =
      audio: true
      video: false

    if !MediaRecorder?
      $scope.canRecord = false
      console.info("Browser nor supported")
      return

    $scope.canRecord = true
    $scope.recordingAvailable = false
    $scope.isRecording = false
    mediaRecorder = {}

    # Need to get non-angular bindable components
    canvas = document.getElementById('audio-recorder-visualiser')
    audio = document.getElementById('audioPlayer')

    audioCtx = new (window.AudioContext || webkitAudioContext)()
    canvasCtx = canvas.getContext("2d")

    $scope.playStop = () ->
      if audio.paused
        audio.play()
        $scope.isPlaying = true
      else
        audio.pause()
        audio.currentTime = 0
        $scope.isPlaying = false
      return

    chunks = []
    blob = {}

    onSuccess = (stream) ->
      options =
        audioBitsPerSecond : 16000,
        mimeType : mediaService.getMimeType()
      mediaRecorder = new MediaRecorder(stream, options)
      visualise(stream)

      $scope.$on('$destroy', () ->
        stream.getTracks().forEach (track) ->
          track.stop()
      )

      $scope.recordingToggle = () ->
        if (!$scope.isRecording)
          mediaRecorder.start()
          $scope.isRecording = true
        else if ($scope.isRecording)
          mediaRecorder.stop()
          $scope.isRecording = false
        return

      mediaRecorder.ondataavailable = (e) ->
        chunks.push(e.data)
        return

      mediaRecorder.onstop = (e) ->
        blob = new Blob(chunks, 'type': options.mimeType)
        chunks = []
        audioURL = window.URL.createObjectURL(blob)
        audio.src = audioURL
        audio.load()
        $scope.$apply( () ->
          $scope.recordingAvailable = true
        )
        return

      btnSend.onclick = ->
        taskService.addMediaComment($scope.task, blob, "audio")
        blob = {}
        $scope.recordingAvailable = false
        taskService.scrollDown()
        return

    onError = (err) ->
      console.log('The following error occured: ' + err)

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)

    visualise = (stream) ->
      source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()

      draw = ->
        WIDTH = canvas.width
        HEIGHT = canvas.height
        requestAnimationFrame draw
        analyser.getByteTimeDomainData(dataArray)
        analyser.getByteFrequencyData(dataArray)
        canvasCtx.fillstyle = '#2196F3'

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
        i = 0
        bar_width = 1
        while i < WIDTH
          bar_x = i * 10
          bar_y = HEIGHT / 2
          bar_height = -(dataArray[i] / 4) + 1
          canvasCtx.fillRect bar_x, bar_y, bar_width, bar_height
          canvasCtx.fillRect bar_x, bar_y - bar_height, bar_width, bar_height
          i++
        return

      source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)
      source.connect analyser
      draw()
      return
    return
