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
      if navigator.userAgent.toLowerCase().indexOf('firefox') > -1
        mimeType = 'audio/ogg'
      else
        mimeType = ''
    mimeType

  mediaService
)
