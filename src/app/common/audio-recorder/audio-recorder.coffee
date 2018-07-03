angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, recorderService) ->
    # recorderSrvc = mediaRecorder
    # mediaRecorder.config.stopTracksAndCloseCtxWhenFinished = cleanupWhenFinished
    # mediaRecorder.config.createDynamicsCompressorNode = addDynamicsCompressor
    mediaRecorder = new recorderService()
    # console.log("Starting recording")
    mediaRecorder.startRecording()
    setTimeout(() ->
      console.log("Stopping Recording")
      mediaRecorder.stopRecording()
    , 4000)
    # mediaRecorder.startRecording()
    # console.log("Started recording")
    return
