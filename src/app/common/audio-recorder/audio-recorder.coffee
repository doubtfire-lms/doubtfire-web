angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, mediaService) ->

    $scope.recordingAvailable = false

    # Need to get non-angular bindable components
    canvas = document.getElementById('audio-recorder-visualiser')
    audio = document.getElementById('audioPlayer')

    audioCtx = mediaService.audioCtx
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

    if (navigator.mediaDevices.getUserMedia)
      constraints =
        audio: true
        mimeType: 'audio/webm'
      chunks = []
      blob = {}

      onSuccess = (stream) ->
        mediaRecorder = new MediaRecorder(stream, {mimeType:'audio/webm'})

        # When the element is removed from the
        # view, stop all recording and tracks
        $scope.$on('$destroy', () ->
          stream.getTracks().forEach (track) ->
            track.stop()
        )

        visualise(stream)

        $scope.recordingToggle = () ->
          if (mediaRecorder.state == "inactive")
            mediaRecorder.start()
            $scope.isRecording = true
          else if (mediaRecorder.state == "recording")
            mediaRecorder.stop()
            $scope.isRecording = false
          return

        btnSend.onclick = ->
          fileReader = new FileReader()
          fileReader.readAsDataURL(blob)
          fileReader.addEventListener 'loadend', ->
            audioRecording = new Blob([ fileReader.result ], 'type': 'audio/webm')
            taskService.addMediaComment($scope.task, audioRecording, "audio")
          blob = {}
          $scope.recordingAvailable = false
          taskService.scrollDown()
          return

        mediaRecorder.onstop = (e) ->
          blob = new Blob(chunks, { 'type' : 'audio/webm' })
          chunks = []
          audioURL = window.URL.createObjectURL(blob)
          audio.src = audioURL
          $scope.$apply( () ->
            $scope.recordingAvailable = true
          )
          return

        mediaRecorder.ondataavailable = (e) ->
          chunks.push(e.data)
          return

      onError = (err) ->
        console.log('The following error occured: ' + err)

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
    else
      console.log('getUserMedia not supported on your browser!')

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
