'use strict';

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {

} else {
    alert('The File APIs are not fully supported by your browser.');
}

// set up basic element variables
var audio = document.getElementById("audioPlayer");

var obj;

function LoadFile() {
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    reader.addEventListener("load", function () {

        var fileData = reader.result;
        console.log(reader.result);

        audio.src = fileData;

    }, false);

    if (file) {
        reader.readAsBinaryString(file);
    }
}