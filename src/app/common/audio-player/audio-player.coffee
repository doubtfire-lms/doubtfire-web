angular.module('doubtfire.common.audio-player', [])

.directive 'audioPlayer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-player/audio-player.tpl.html'

  controller: ($scope, CommentResourceService, Task, $sce, $http, $q) ->
    DEFAULT_HEIGHT = 300

    $scope.loadPlayer = false

    $scope.commentAudioUrl = CommentResourceService.commentAudioUrl

    #=========================================================================
    getAudioComment = (comment, audioElement) ->
      audioUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))
      $http({url: audioUrl, method: "get", withCredentials: true, params: ""}, responseType: "text").then (response) ->
        audioElement.src = $sce.trustAsResourceUrl(response.data)

    #=========================================================================
    # AUDIO PLAYER SETUP
    $scope.audioPlayerSetup = (index, comment)->

      isPlaying = false
      btnPlay = document.getElementById('btnPlay-' + index)
      audioElement = document.getElementById('audio-element-' + index)
      getAudioComment(comment,audioElement)
      audioElement.crossOrigin = "anonymous"
      canvasElement = document.getElementById('audio-visualiser-' + index)

      CommentResourceService.setupAudioContext()
      audioCtx = CommentResourceService.audioContext

      canvasCtx = canvasElement.getContext('2d')
      audioSource = audioCtx.createMediaElementSource(audioElement)

      $scope.loadPlayer = true

      #---------------------------------------------
      # ELEMENT EVENTS
      #---------------------------------------------
      btnPlay.onclick = ->
        playAudio()

      playAudio = ->
        if isPlaying
          audioElement.pause()
          audioElement.currentTime = 0
          stopDrawing()
        else
          # fixed volume as it would increase on pause for some reason
          audioElement.volume = 0.75
          audioElement.play()
          startDrawing()
        return

      audioElement.onplay = ->
        btnPlay.src = "/assets/icons/stop.png"
        isPlaying = true
        return

      audioElement.onended = ->
        btnPlay.src = "/assets/icons/play.png"
        isPlaying = false
        stopDrawing()
        return

      audioElement.onpause = ->
        btnPlay.src = "/assets/icons/play.png"
        isPlaying = false
        stopDrawing()
        return

      #---------------------------------------------
      # VISUALISE AUDIO
      #---------------------------------------------
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
        canvasCtx.clearRect 0, 0, canvasElement.width, canvasElement.height
        return

      source = undefined
      analyser = undefined
      bufferLength = undefined
      dataArray = undefined

      draw = ->
        analyser.getByteTimeDomainData dataArray
        analyser.getByteFrequencyData dataArray
        canvasCtx.fillstyle = '#000000'
        bars = 100 * canvasElement.width/100
        clearGraph()
        i = 0
        while i < bars
          bar_x = i * 3
          bar_width = 2
          bar_height = -(dataArray[i] / 4) + 1
          canvasCtx.fillRect bar_x, canvasElement.height / 2, bar_width, bar_height
          canvasCtx.fillRect bar_x, canvasElement.height / 2 - bar_height, bar_width, bar_height
          i++
        return

      prepareVisualise = ->
        # Initialise analyser
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
        audioSource.connect analyser
        analyser.connect audioCtx.destination
        return
      #---------------------------------------------
      # FUNCTIONS TO CALL FOR SETUP
      #---------------------------------------------
      prepareVisualise()
      playAudio()
      #=========================================================================


