angular.module("doubtfire.common.services.wav-encoder", [])
.factory("WavEncoder", ->

  WavEncoder = () ->

    BYTES_PER_SAMPLE =   2
    recorded = []

    encode = (buffer) ->
      length = buffer.length
      data = new Uint8Array(length * BYTES_PER_SAMPLE)
      i = 0
      while i < length
        index = i * BYTES_PER_SAMPLE
        sample = buffer[i]
        if sample > 1
          sample = 1
        else if sample < -1
          sample = -1
        sample = sample * 32768
        data[index] = sample
        data[index + 1] = sample >> 8
        i++
      recorded.push data
      return

    dump = (sampleRate) ->
      bufferLength = if recorded.length then recorded[0].length else 0
      length = recorded.length * bufferLength
      wav = new Uint8Array(44 + length)
      view = new DataView(wav.buffer)
      # RIFF identifier 'RIFF'
      view.setUint32 0, 1380533830, false
      # file length minus RIFF identifier length and file description length
      view.setUint32 4, 36 + length, true
      # RIFF type 'WAVE'
      view.setUint32 8, 1463899717, false
      # format chunk ide  ntifier 'fmt '
      view.setUint32 12, 1718449184, false
      # format chunk length
      view.setUint32 16, 16, true
      # sample format (raw)
      view.setUint16 20, 1, true
      # channel count
      view.setUint16 22, 1, true
      # sample rate
      view.setUint32 24, sampleRate, true
      # byte rate (sample rate * block align)
      view.setUint32 28, sampleRate * BYTES_PER_SAMPLE, true
      # block align (channel count * bytes per sample)
      view.setUint16 32, BYTES_PER_SAMPLE, true
      # bits per sample
      view.setUint16 34, 8 * BYTES_PER_SAMPLE, true
      # data chunk identifier 'data'
      view.setUint32 36, 1684108385, false
      # data chunk length
      view.setUint32 40, length, true
      i = 0
      while i < recorded.length
        wav.set recorded[i], i * bufferLength + 44
        i++
      recorded = []
      msg = [ wav.buffer ]
      postMessage msg, [ msg[0] ]
      return

    self.onmessage = (e) ->
      console.log(e)
      if e.data[0] == 'encode'
        encode e.data[1]
      else if e.data[0] == 'dump'
        dump e.data[1]
      else if e.data[0] == 'close'
        self.close()
      return

  return WavEncoder
)