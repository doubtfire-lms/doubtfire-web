angular.module("doubtfire.common.services.media-service", [])
#
# Services for working with media APIs
#
.factory("mediaService", ($rootScope, $timeout, $sce) ->
  mediaService = {}

  mediaService.audioCtx = mediaService.audioCtx? || (new (window.AudioContext || webkitAudioContext)())

  mediaService.getMimeType = () ->
    mimeType = 'audio/webm'
    if !MediaRecorder.isTypeSupported(mimeType)
      console.log mimeType + ' is not Supported'
      if navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        console.log("Using Firefox")
        mimeType = 'audio/ogg'
      else
        mimeType = ''
    mimeType

  mediaService
)
