angular.module("doubtfire.common.services.media-service", [])
#
# Services for working with media APIs
#
.factory("mediaService", ($rootScope, $timeout, $sce) ->
  mediaService = {}

  mediaService.audioCtx = audioCtx? || (new (window.AudioContext || webkitAudioContext)())

  mediaService.fetchContext = () ->
    if !globalAudioContext?
      globalAudioContext = new ((window.AudioContext or webkitAudioContext))
    globalAudioContext

  mediaService
)
