angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, CommentResourceService, mediaService, Task, $sce, $q) ->

    angular.element(document).ready( ->
      $scope.audioSetup()
    )

    $scope.audioSetup = ->
      console.info("Setting up audiosetup")
      # Support multiple browsers
      navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia

      audioURL = undefined
      streamRef = undefined
      mediaRecorderRef = undefined
      dataRef = undefined
      activeTrack = false
      isPlaying = false

      btnRecord = document.getElementById('btnRecord')
      btnPlay = document.getElementById('btnPlay')
      btnSend = document.getElementById('btnSend')
      btnDelete = document.getElementById('btnDelete')
      canvas = document.getElementById('audio-recorder-visualiser')
      audio = document.getElementById('audioPlayer')

      console.info("setup recorder media object")
      mediaObject = mediaService.createContext(audio, canvas)

      console.info(mediaObject)

      StartRecord = ->
        streamRef.getTracks()[0].enabled = true
        mediaRecorderRef.start()
        mediaObject.prepareVisualise(streamRef)
        # mediaObject.startDrawing()
        return

      #---------------------------------------------
      # Sets up all the elements that will be used for recording
      initElements = ->

        isRecording = false
        localStream = undefined

        #Record button
        btnRecord.onclick = ->
          if !isRecording
            initRecording()
            # Update buttons
            btnRecord.src = "/assets/icons/record_active.png"
            btnPlay.disabled = true
            btnSend.disabled = true
            isRecording = true
            audio.removeAttribute('src')
          else
            # Update buttons
            btnRecord.src = "/assets/icons/record.png"
            btnPlay.disabled = false
            btnSend.disabled = false
            # Stop recording audio
            mediaRecorderRef.stop()
            streamRef.getTracks()[0].enabled = false
            isRecording = false
            # Clear visualisation
            mediaObject.stopDrawing()
          return false

        # Play button
        btnPlay.onclick = ->
          mediaObject.playAudio()
          return

        # Send button
        # btnSend.onclick = ->
        #   streamRef.getTracks()[0].enabled = false
        #   # prepare audio for sending
        #   downloadMediaContent = mediaService.prepareRecordedAudio(dataRef)
        #   console.info("POST AUDIO")
        #   console.info(downloadMediaContent)
        #   taskService.addMediaComment(CommentResourceService.task, downloadMediaContent, "audio")
        #   return false

        # audio.onplay = ->
        #   console.info("Playing")
        #   btnPlay.src = "/assets/icons/stop.png"
        #   isPlaying = true
        #   return

        # audio.onended = ->
        #   console.info("Ended")
        #   btnPlay.src = "/assets/icons/play.png"
        #   isPlaying = false
        #   # mediaObject.stopDrawing()
        #   return

        # audio.onpause = ->
        #   console.info("Paused")
        #   btnPlay.src = "/assets/icons/play.png"
        #   isPlaying = false
        #   # mediaObject.stopDrawing()
        #   return

        return

      #---------------------------------------------
      # pass initRecording a cb to call when stream is ready
      initRecording = ->
        if navigator.mediaDevices and navigator.mediaDevices.getUserMedia
          navigator.getUserMedia {
            audio: true
          }, ((stream) ->
            mediaRecorder = new MediaRecorder(stream)

            #set refs to be used in buttons
            mediaRecorderRef = mediaRecorder
            streamRef = stream
            streamRef.getTracks()[0].enabled = false

            mediaRecorder.ondataavailable = (e) ->
              data = e.data
              audioURL = window.URL.createObjectURL(data)
              audio.src = audioURL
              dataRef = data
              mediaObject.prepareVisualise(audio)
              return
            StartRecord()
          ), (err) ->
            console.log 'The following error occured: ' + err
          return
        else
          console.log 'getUserMedia is not supported on your browser!'
        return
      #---------------------------------------------
      initElements()
      return
