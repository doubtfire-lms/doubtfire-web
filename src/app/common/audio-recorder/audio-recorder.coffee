angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, recorderService, alertService) ->

    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      $canRecord = false
      return
    $scope.canRecord = true

    mediaRecorder = new recorderService()

    # Required for recording multiple times
    mediaRecorder.config.stopTracksAndCloseCtxWhenFinished = true
    # Required for visualising the stream
    mediaRecorder.config.createAnalyserNode = true

    mediaRecorder.em.addEventListener('recording', (evt) -> onNewRecording(evt))
    $scope.recordingAvailable = false
    $scope.isRecording = false

    chunks = []
    blob = {}

    # Need to get non-angular bindable components
    canvas = document.getElementById('audio-recorder-visualiser')
    audio = document.getElementById('audioPlayer')
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

    onNewRecording = (evt) ->
      blob = evt.detail.recording.blob
      audio.src = evt.detail.recording.blobUrl
      audio.load()
      $scope.$apply( () ->
        $scope.recordingAvailable = true
      )
      return

    visualise = () ->
      draw = ->
        WIDTH = canvas.width
        HEIGHT = canvas.height
        requestAnimationFrame(draw)
        analyser.getByteTimeDomainData(dataArray)
        analyser.getByteFrequencyData(dataArray)

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

      source = mediaRecorder.inputStreamNode
      analyser = mediaRecorder.analyserNode
      analyser.fftSize = 2048
      bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)
      draw()
      return

    $scope.recordingToggle = () ->
      if (!$scope.isRecording)
        mediaRecorder.startRecording()
        visualise()
        $scope.isRecording = true
      else if ($scope.isRecording)
        mediaRecorder.stopRecording()
        $scope.isRecording = false
      return

    $scope.sendRecording = () ->
      taskService.addMediaComment($scope.task, blob,
        (success) ->
          taskService.scrollDown()
        (failure) ->
          alertService.add('danger', "Failed to post audio. #{failure.data?.error}")
      )
      blob = {}
      $scope.recordingAvailable = false
      taskService.scrollDown()
      return

    return
