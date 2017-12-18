/*
* POC block to generate audio waveform for live stream and
* recorded audio.
* @authors: Ben Philip, Matthew Van Zyl
*/

'use strict';

// Support multiple browsers
navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);

// set up basic element variables
var btnRecord = document.getElementById("btnRecord");
var soundClips = document.querySelector(".sound-clips");
var canvas = document.getElementById("visualizer");

// visualiser setup - create web audio context and canvas
var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");

// Global references
var deleteButton, downloadButton;
var audio, audioURL;

// canvas variables
var WIDTH, HEIGHT;

// Track the visualiser
var isVisualise = false;

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    
    console.log('getUserMedia supported.');

    navigator.getUserMedia(
        { audio: true, video: false },
        
        // Success callback
        function (stream) {        
            var mediaRecorder = new MediaRecorder(stream);
            controlAudioRecording(stream, mediaRecorder),
            
            mediaRecorder.ondataavailable = function (e) {
                console.log("data available");
                    
                // Create HTML for an audio player that uses the recorded audio as a source
                audio = addHTMLElements();

                // URL for the audio
                var data = e.data;
                audioURL = window.URL.createObjectURL(data);
                audio.src = audioURL;
                
                audio.onplay = function () {
                    isVisualise = true; //Start visualisation
                    visualise(audio, false);
                }
                
                audio.onpause = function () {
                    isVisualise = false; //Stop visualisation
                }

                // Prepare for download
                prepareDownloadWAV(data, "test.blob");
            }
        },
        
        // Error callback
        function (err) {
            console.log('The following gUM error occured: ' + err);
        }
    );

} else {
        console.log('getUserMedia is not supported on your browser!');
}

/*
* Function to control media recording through the record
* button.
*/
function controlAudioRecording(stream, mediaRecorder) {
    
    //RECORD BUTTON
    var isRecording;

    btnRecord.onclick = function() {
        if (!isRecording) {
            //Show visualisation
            isVisualise = true; 
            visualise(stream, true); 
                                
            //Start recording
            mediaRecorder.start();
            console.log(mediaRecorder.state);
            btnRecord.innerHTML = "Stop recording";
            isRecording = true;
        
        } else {
            //Clear visualisation 
            isVisualise = false;
            clearGraph();
        
            //Stop recording audio
            mediaRecorder.stop();               
            console.log(mediaRecorder.state);
            btnRecord.innerHTML = "Record";
            isRecording = false;
        }
    }
}

/*
* Prepare wav file for download 
*/
function prepareDownloadWAV(blob, filename) {

    var size = blob.size;
    var type = blob.type;

    var reader = new FileReader();
    console.log("Here");

    //Serialize the data to localStorage...
    var base64FileData = blob.toString();

    var mediaFile = {
        fileUrl: audioURL,
        size: blob.size,
        type: blob.type,
        src: base64FileData
    };
                
    var audioBlob = new Blob([mediaFile], {type: 'audio/wav'});
        
    //var wavFile = new Blob([mediaFile], {type: 'audio/wav'});
    var downloadAudio = window.URL.createObjectURL(audioBlob);

    var link = document.getElementById('downloadRec');
    link.href = downloadAudio;

    return;
}


/*
* Download functions
* downloadButton.onClick
*/
function prepareDownloadWAV123() {
    
    audio.src = null;
        
    fetch(audioURL).then(function (res) {

        res.blob().then(function (blob) {
            var size = blob.size;
            var type = blob.type;

            var reader = new FileReader();
            reader.addEventListener("loadend", function () {

                console.log('reader.result:', reader.result);

                //play the base64 encoded data directly works
                audio.src = reader.result;

                //Serialize the data to localStorage and read it back then play...
                var base64FileData = reader.result.toString();

                var mediaFile = {
                    fileUrl: audioURL,
                    size: blob.size,
                    type: blob.type,
                    src: base64FileData
                };
                        
                var audioBlob = new Blob([mediaFile], {type: 'audio/wav'});
                var wavFile = new File(audioBlob, 'test.wav');
                
                //var wavFile = new Blob([mediaFile], {type: 'audio/wav'});
                var downloadAudio = window.URL.createObjectURL(wavFile);

                var link = document.getElementById('downloadRec');
                link.href = downloadAudio;
                console.log("Wav Done")

                //save the file info to localStorage
                localStorage.setItem('myTest', JSON.stringify(mediaFile));  

                //read out the file info from localStorage again
                var reReadItem = JSON.parse(localStorage.getItem('myTest'));
                audio.src = reReadItem.src;
                console.log("Downloaded"); 
            });

            reader.readAsDataURL(blob);
        });
    });
}

/*
* Function to add html elements to the page and return an
* audio object.
*/
function addHTMLElements() {

    var clipContainer = document.createElement('article');
    var clipLabel = document.createElement('p');
    var audio = document.createElement('audio');
    deleteButton = document.createElement('button');
    downloadButton = document.createElement('button');

    clipContainer.classList.add('clip');
    audio.setAttribute('controls', '');
    deleteButton.innerHTML = "Delete";
    downloadButton.innerHTML = "Download";

    clipContainer.appendChild(audio);
    clipContainer.appendChild(deleteButton);
    clipContainer.appendChild(downloadButton);
    soundClips.appendChild(clipContainer);

    // Removes audio recording html elements
    deleteButton.onclick = function (e) {
        var evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
    }

    return audio;
}

/*
* Visualise audio
* Takes input (either stream or audio)
*/
function visualise(input, isStream) {

    var source, analyser, bufferLength, dataArray;

    // Set source as stream or pre-recorded audio
    if (isStream) {
        source = audioCtx.createMediaStreamSource(input);
    } else {
        source = audioCtx.createMediaElementSource(input);
    }

    // Initialise analyser     
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    if (!isStream)
        analyser.connect(audioCtx.destination); //required to hear sound

    draw();

    // Visualisation - drawing the bars based on the audio
    function draw() {
    
        var bars, bar_x, bar_width, bar_height;
        WIDTH = canvas.width;
        HEIGHT = canvas.height;

        if (!isVisualise)
            return;

        requestAnimationFrame(draw);
    
        analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillstyle = "#000000";
        bars = 200;
    
        clearGraph();

        for (var i = 0; i < bars; i++) {
            bar_x = i * 3;
            bar_width = 2;
            bar_height = -(dataArray[i] / 4) + 1;
    
            canvasCtx.fillRect(bar_x, HEIGHT / 2, bar_width, bar_height);
            canvasCtx.fillRect(bar_x, (HEIGHT / 2) - bar_height, bar_width, bar_height);
        }
    }
}

/* 
* Reset visualiser
*/
function clearGraph() {

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
}