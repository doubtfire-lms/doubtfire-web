angular.module("doubtfire.common.services.media-service", [])
#
# Services for working with media APIs
#
.factory("mediaService", ($rootScope, $timeout, $sce) ->
  mediaService = {}

  globalAudioContext = null

  mediaService.fetchContext = () ->
    if !globalAudioContext?
      globalAudioContext = new ((window.AudioContext or webkitAudioContext))
    globalAudioContext

  mediaService.createContext = (audioElement, canvasVisualiserElement) ->
    audioElement.crossOrigin = "anonymous"
    mediaObject = {
      audioCtx:                 mediaService.fetchContext(),
      audioSource:              mediaService.fetchContext().createMediaElementSource(audioElement),
      audioElement:             audioElement,
      canvasVisualiserElement:  canvasVisualiserElement,
      canvasCtx:                canvasVisualiserElement.getContext('2d'),
      analyser:                 mediaService.fetchContext().createAnalyser(),
      drawTimer:                undefined,
      dataArray:                undefined

      stop: ->
        mediaObject.audioElement.pause()
        mediaObject.audioElement.currentTime = 0
        mediaObject.analyser.disconnect()
        mediaObject.audioSource.disconnect()

      playAudio: ->
        if not(mediaObject.audioElement.paused)
          mediaObject.stop()
        else
          mediaObject.prepareVisualise()
          mediaObject.analyser.connect(mediaObject.audioCtx.destination)
          mediaObject.audioSource.connect(mediaObject.analyser)
          audioElement.play()
          mediaObject.startDrawing()
        return

      startDrawing: ->
        clearInterval(mediaObject.drawTimer)
        mediaObject.clearGraph()
        mediaObject.drawTimer = setInterval(mediaObject.draw, 0.1)
        return

      stopDrawing: ->
        clearInterval(mediaObject.drawTimer)
        mediaObject.clearGraph()
        return

      clearGraph: ->
        mediaObject.canvasCtx.clearRect(0, 0, canvasVisualiserElement.width, canvasVisualiserElement.height)
        return

      draw: ->
        mediaObject.analyser.getByteTimeDomainData(mediaObject.dataArray)
        mediaObject.analyser.getByteFrequencyData(mediaObject.dataArray)
        mediaObject.canvasCtx.fillstyle = '#000000'
        bars = 100 * mediaObject.canvasVisualiserElement.width/100
        mediaObject.clearGraph()
        i = 0
        while i < bars
          bar_x = i * 3
          bar_width = 2
          bar_height = -(mediaObject.dataArray[i] / 4) + 1
          mediaObject.canvasCtx.fillRect bar_x, mediaObject.canvasVisualiserElement.height / 2, bar_width, bar_height
          mediaObject.canvasCtx.fillRect bar_x, mediaObject.canvasVisualiserElement.height / 2 - bar_height, bar_width, bar_height
          i++
        return

      prepareVisualise: (stream = null) ->
        if stream instanceof MediaStream
          mediaObject.audioSource = mediaObject.audioCtx.createMediaStreamSource(stream)
        mediaObject.analyser = mediaObject.audioCtx.createAnalyser()
        mediaObject.analyser.fftSize = 2048
        bufferLength = mediaObject.analyser.frequencyBinCount
        mediaObject.dataArray = new Uint8Array(bufferLength)
        # mediaObject.audioSource.connect(mediaObject.analyser)
        # if not (stream instanceof MediaStream)
          # mediaObject.analyser.connect(mediaObject.audioCtx.destination)
        return


        # prepareVisualise = ->
          # # Initialise analyser
          # analyser = audioCtx.createAnalyser()
          # analyser.fftSize = 2048
          # bufferLength = analyser.frequencyBinCount
          # dataArray = new Uint8Array(bufferLength)
          # audioSource.connect analyser
          # analyser.connect audioCtx.destination
          # return


        # prepareVisualise = (input, isStream) ->
        # if isStream
        #   source = audioCtx.createMediaStreamSource(input)
        # else
        #   source = audioSource
        # Initialise analyser

        # analyser = audioCtx.createAnalyser()
        # analyser.fftSize = 2048
        # bufferLength = analyser.frequencyBinCount
        # dataArray = new Uint8Array(bufferLength)
        # source.connect analyser
        # if !isStream
        #   analyser.connect(audioCtx.destination)
        # return
    }

    mediaObject.audioElement.onplay = ->
      return

    mediaObject.audioElement.onended = ->
      console.info("ended")
      mediaObject.stop()
      return

    mediaObject.audioElement.onpause = ->
      console.info("paused playing")
      mediaObject.stopDrawing()

    mediaObject

  mediaService.prepareRecordedAudio = (data) ->
    # downloadMediaContent = undefined
    # audioFileURL = window.URL.createObjectURL(data)
    # fetch(audioFileURL).then (result) ->
    #   result.blob().then (blob) ->
    #     size = blob.size
    #     type = blob.type
    #     fileReader = new FileReader
    #     fileReader.readAsDataURL blob
    #     fileReader.addEventListener 'loadend', ->
    #       fileData = fileReader.result
    #       downloadMediaContent = new Blob([ fileData ], 'type': type)
    #       downloadLink = document.getElementById('btnSend')
    #       mediaUrl = window.URL.createObjectURL(downloadMediaContent)
    #       downloadLink.href = mediaUrl
    # downloadMediaContent

  mediaService
)
