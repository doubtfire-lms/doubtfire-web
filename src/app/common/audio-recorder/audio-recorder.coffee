angular.module('doubtfire.common.audio-recorder', [])

.directive 'audioRecorder', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-recorder/audio-recorder.tpl.html'

  controller: ($scope, taskService, mediaService) ->
    angular.element(document).ready( ->
      audioSetup()
    )

    audioSetup = ->
      btnRecord = document.getElementById('btnRecord')
      btnPlay = document.getElementById('btnPlay')
      btnSend = document.getElementById('btnSend')
      btnDelete = document.getElementById('btnDelete')
      canvas = document.getElementById('audio-recorder-visualiser')
      audio = document.getElementById('audioPlayer')

      audioCtx = mediaService.audioCtx
      canvasCtx = canvas.getContext("2d")

      if (navigator.mediaDevices.getUserMedia)
        console.log('getUserMedia supported.')
        constraints =
          audio: true
          mimeType: 'audio/wav'
        chunks = []
        blob = {}

        onSuccess = (stream) ->
          mediaRecorder = new MediaRecorder(stream)

          visualise(stream)

          btnRecord.onclick = ->
            console.log(mediaRecorder.state)
            if (mediaRecorder.state == "inactive")
              mediaRecorder.start()
              $scope.$apply( () ->
                $scope.isRecording = true
              )
            else if (mediaRecorder.state == "recording")
              mediaRecorder.stop()
              $scope.$apply( () ->
                $scope.isRecording = false
              )

          btnSend.onclick = ->
            fileReader = new FileReader()
            fileReader.readAsDataURL(blob)
            fileReader.addEventListener 'loadend', ->
              audioRecording = new Blob([ fileReader.result ], 'type': 'audio/wav')
              taskService.addMediaComment($scope.task, audioRecording, "audio")
            blob = {}
            return

          mediaRecorder.onstop = (e) ->
            audio.controls = true
            blob = new Blob(chunks, { 'type' : 'audio/wav' })
            chunks = []
            audioURL = window.URL.createObjectURL(blob)
            audio.src = audioURL

          mediaRecorder.ondataavailable = (e) ->
            chunks.push(e.data)

        onError = (err) ->
          console.log('The following error occured: ' + err)

        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
      else
        console.log('getUserMedia not supported on your browser!')


      stopRecording = ->
        mediaRecorder.stop()
        stop.disabled = true
        btnRecord.disabled = false

      visualise = (stream) ->
        source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()

        draw = ->
          WIDTH = canvas.width
          HEIGHT = canvas.height
          requestAnimationFrame draw
          analyser.getByteTimeDomainData(dataArray)
          analyser.getByteFrequencyData(dataArray)
          canvasCtx.fillstyle = '#000000'

          bars = 100 * WIDTH/100
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
          i = 0
          while i < bars
            bar_x = i * 3
            bar_width = 2
            bar_height = -(dataArray[i] / 4) + 1
            canvasCtx.fillRect bar_x, HEIGHT / 2, bar_width, bar_height
            canvasCtx.fillRect bar_x, HEIGHT / 2 - bar_height, bar_width, bar_height
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
