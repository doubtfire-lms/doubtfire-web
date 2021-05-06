# Parts adapted from https://github.com/kaliatech/web-audio-recording-tests

angular.module("doubtfire.common.services.recorder-service", [])
#
# Services for working with cross-platform, media Recording APIs
#
.factory("recorderService", ($rootScope, $timeout, $sce) ->
  return class RecorderService
    constructor: () ->
      window.AudioContext = window.AudioContext || window.webkitAudioContext

      @em = document.createDocumentFragment()
      @state = 'inactive'
      @audioCtx = {}
      @chunks = []
      @chunkType = ''

      @usingMediaRecorder = window.MediaRecorder || false

      @encoderMimeType = 'audio/wav'

      @config = {
        broadcastAudioProcessEvents: false,
        createAnalyserNode: true,
        createDynamicsCompressorNode: false,
        forceScriptProcessor: false,
        manualEncoderId: 'wav',
        micGain: 1.0,
        processorBufferSize: 2048,
        stopTracksAndCloseCtxWhenFinished: true,
        userMediaConstraints: {
          audio: true
        }
      }
      return

    # Called once when the recording is initated
    startRecording: () ->
      if (@state != 'inactive')
        return

      #  This is the case on ios/chrome, when clicking links from within ios/slack (sometimes), etc.
      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        console.error('Missing support for navigator.mediaDevices.getUserMedia') # temp: helps when testing for strange issues on ios/safari
        return

      @audioCtx = new AudioContext()
      @micGainNode = @audioCtx.createGain()
      @outputGainNode = @audioCtx.createGain()

      if (@config.createDynamicsCompressorNode)
        @dynamicsCompressorNode = audioCtx.createDynamicsCompressor()


      if (@config.createAnalyserNode)
        @analyserNode = @audioCtx.createAnalyser()


      #  If not using MediaRecorder(i.e. safari and edge), then a script processor is required. It's optional
      #  on browsers using MediaRecorder and is only useful if wanting to do custom analysis or manipulation of
      #  recorded audio data.
      if (@config.forceScriptProcessor || @config.broadcastAudioProcessEvents || !@usingMediaRecorder)
        @processorNode = @audioCtx.createScriptProcessor(@config.processorBufferSize, 1, 1) # TODO: Get the number of channels from mic

      #  Create stream destination on chrome/firefox because, AFAICT, we have no other way of feeding audio graph output
      #  in to MediaRecorderSafari/Edge don't have this method as of 2018-04.
      if (@audioCtx.createMediaStreamDestination)
        @destinationNode = @audioCtx.createMediaStreamDestination()
      else
        @destinationNode = @audioCtx.destination

      #  Create web worker for doing the encoding
      if (!@usingMediaRecorder)
        @encoderWorker = new Worker('/assets/wav-worker.js')
        @encoderMimeType = 'audio/wav'

        that = this
        @encoderWorker.addEventListener('message', (e) ->
          event = new Event('dataavailable')
          if (that.config.manualEncoderId == 'ogg')
            event.data = e.data
          else
            event.data = new Blob(e.data, { type: that.encoderMimeType })
          that._onDataAvailable(event)
        )

      #  This will prompt user for permission if needed
      that = this
      return navigator.mediaDevices.getUserMedia(@config.userMediaConstraints)
        .then((stream) ->
          that._startRecordingWithStream(stream)
        )
        .catch((error) ->
          return
        )
      return

    setMicGain: (newGain) ->
      @config.micGain = newGain
      if (@audioCtx && @micGainNode)
        @micGainNode.gain.setValueAtTime(newGain, @audioCtx.currentTime)
      return

    _startRecordingWithStream: (stream) ->
      @micAudioStream = stream
      @inputStreamNode = @audioCtx.createMediaStreamSource(@micAudioStream)
      @audioCtx = @inputStreamNode.context

      #  Kind-of a hack to allow hooking in to audioGraph mediaRecorder.inputStreamNode
      if (@onGraphSetupWithInputStream)
        @onGraphSetupWithInputStream(@inputStreamNode)

      @inputStreamNode.connect(@micGainNode)
      @micGainNode.gain.setValueAtTime(@config.micGain, @audioCtx.currentTime)

      nextNode = @micGainNode
      if (@dynamicsCompressorNode)
        @micGainNode.connect(@dynamicsCompressorNode)
        nextNode = @dynamicsCompressorNode

      @state = 'recording'

      if (@processorNode)
        nextNode.connect(@processorNode)
        @processorNode.connect(@outputGainNode)
        that = this
        @processorNode.onaudioprocess = (e) -> that._onAudioProcess(e)
      else
        nextNode.connect(@outputGainNode)

      if (@analyserNode)
        nextNode.connect(@analyserNode)

      @outputGainNode.connect(@destinationNode)

      if (@usingMediaRecorder)
        @mediaRecorder = new MediaRecorder(@destinationNode.stream)
        that = this
        @mediaRecorder.addEventListener('dataavailable', (evt) -> that._onDataAvailable(evt))
        @mediaRecorder.addEventListener('error', (evt) -> @_onError(evt))

        @mediaRecorder.start()
      else
        @outputGainNode.gain.setValueAtTime(0, @audioCtx.currentTime)
      return

    _onAudioProcess: (e) ->
      if (@config.broadcastAudioProcessEvents)
        @em.dispatchEvent(new CustomEvent('onaudioprocess', {
          detail: {
            inputBuffer: e.inputBuffer,
            outputBuffer: e.outputBuffer
          }
        }))
      if (!@usingMediaRecorder)
        if (@state == 'recording')
          if (@config.broadcastAudioProcessEvents)
            @encoderWorker.postMessage(['encode', e.outputBuffer.getChannelData(0)])
          else
            @encoderWorker.postMessage(['encode', e.inputBuffer.getChannelData(0)])
      return

    processChunks: () ->
      if (@state == 'inactive')
        return
      this._dumpChunks()
      return

    _dumpChunks: () ->
      if(@usingMediaRecorder)
        @mediaRecorder.requestData()

      if (!@usingMediaRecorder)
        @encoderWorker.postMessage(['dump', @audioCtx.sampleRate])
        clearInterval(@slicing)

    # Called once when the recording has been stopped
    stopRecording: () ->
      if (@state == 'inactive')
        return
      if (@usingMediaRecorder)
        @state = 'inactive'
        @mediaRecorder.stop()
      else
        @state = 'inactive'
        @encoderWorker.postMessage(['dump', @audioCtx.sampleRate])
        clearInterval(@slicing)
      return

    # Called each time a chunk of recording becomes available
    _onDataAvailable: (evt) ->
      @chunks.push(evt.data)
      @chunkType = evt.data.type

      blob = new Blob(@chunks, { 'type': @chunkType })
      blobUrl = URL.createObjectURL(blob)
      recording = {
        ts: new Date().getTime(),
        blobUrl: blobUrl,
        mimeType: blob.type,
        size: blob.size
        blob: blob
      }

      @em.dispatchEvent(new CustomEvent('recording', { detail: { recording: recording } }))

      @chunks = []

      if (@state != 'inactive')
        return

      this._cleanup()
      return

    _cleanup: () ->
      @chunkType = null
      if (@destinationNode)
        @destinationNode.disconnect()
        @destinationNode = null
      if (@outputGainNode)
        @outputGainNode.disconnect()
        @outputGainNode = null
      if (@analyserNode)
        @analyserNode.disconnect()
        @analyserNode = null
      if (@processorNode)
        @processorNode.disconnect()
        @processorNode = null
      if (@encoderWorker)
        @encoderWorker.postMessage(['close'])
        @encoderWorker = null
      if (@dynamicsCompressorNode)
        @dynamicsCompressorNode.disconnect()
        @dynamicsCompressorNode = null
      if (@micGainNode)
        @micGainNode.disconnect()
        @micGainNode = null
      if (@inputStreamNode)
        @inputStreamNode.disconnect()
        @inputStreamNode = null

      if (@config.stopTracksAndCloseCtxWhenFinished)
        # This removes the red bar in iOS/Safari
        @micAudioStream.getTracks().forEach((track) -> track.stop())
        @micAudioStream = null

        @audioCtx.close()
        @audioCtx = null

      return

    _onError: (evt) ->
      @em.dispatchEvent(new Event('error'))
      return
)
