'use strict';

var isHost;

window.onload = function () {
	console.log("window.onload");
	// alert($('#id_alias').val());
	
    var url = document.location.href, params = url.split('?')[1].split('&'), data = {}, tmp;
    for (var i = 0, l = params.length; i < l; i++) {
         tmp = params[i].split('=');
         data[tmp[0]] = tmp[1];
    }
    // document.getElementById('here').innerHTML = data.name;
    var alias = data.alias;
    var name = data.name;
    var bandwidth = data.bandwidth;
    var source = data.source;
    var pin = data.pin;
    isHost = data.isHost;

    console.log("Alias:" +alias);
    console.log("Name:" +name);
    console.log("Bandwidth:" +bandwidth);
    console.log("Source:" +source);
    console.log("Pin:" +pin);
    console.log("isHost:" +isHost);
  
    // initialise("pex3-dev.kp.org", alias, bandwidth, name, "", source);
    initialise("vve-tpmg-lab.kp.org", alias, bandwidth, name, "", source);
    // initialise("ttgpexip.ttgtpmg.net", alias, bandwidth, name, "", source);
    // rtc.connect(pin);
}

/* -------------------- CallStats - START -------------------- */
/*var callstats;
//initialize the app with application tokens
var AppID     = "468948303";
var AppSecret = "sDcYsqQkO25I:WCIYaqj5sXu2uruyNyT3cH6qlUu4PAgWHSKZZLIeXF0=";
var localUserID = "abc123";
var remoteUserID = "xyz123";
var csInitCallback;
var csStatsCallback;
var configParams;*/
/* -------------------- CallStats - END -------------------- */

const videoElement = document.querySelector('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');
const callStats = document.getElementById('callstats-btn');

const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#speakerSource');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

const togglePipButton = document.getElementById('togglePipButton');
var deviceInfos;

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  // videoElement.srcObject = stream;
  selfvideo.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  
  if(error === PERMISSION_DENIED) {
  	alert("PERMISSION_DENIED");
  }
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
  // videoElement.play();
}

audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;

videoSelect.onchange = start;


start();


selfvideo.onplaying = () => {
	console.log("videoElement playing");

  canvas.height = selfvideo.videoHeight;
  canvas.width = selfvideo.videoWidth;
};

/* -------------------- Picture in Picture (PIP) - START -------------------- */
togglePipButton.addEventListener('click', async function (event) {
    togglePipButton.disabled = true; //disable toggle button while the event occurs
    try {
        // If there is no element in Picture-in-Picture yet, request for it
        if (videoElement !== document.pictureInPictureElement) {
            await videoElement.requestPictureInPicture();
        }
        // If Picture-in-Picture already exists, exit the mode
        else {
            await document.exitPictureInPicture();
        }

    } catch (error) {
        console.log(`Oh Horror! ${error}`);
    } finally {
        togglePipButton.disabled = false; //enable toggle button after the event
    }
});

videoElement.addEventListener('enterpictureinpicture', function (event) {
    console.log('Entered PiP');
    pipWindow = event.pictureInPictureWindow;
    console.log(`Window size -  \n Width: ${pipWindow.width} \n Height: ${pipWindow.height}`);
});

videoElement.addEventListener('leavepictureinpicture', function (event) {
    console.log('Left PiP');
    togglePipButton.disabled = false;
});


if ('pictureInPictureEnabled' in document) {
    showPipButton();
    videoElement.addEventListener('loadedmetadata', showPipButton);
    videoElement.addEventListener('emptied', showPipButton);
} else {
    togglePipButton.hidden = true;
}

function showPipButton() {
    togglePipButton.disabled = (videoElement.readyState === 0) || !document.pictureInPictureEnabled ||videoElement.disablePictureInPicture;
}
/* -------------------- Picture in Picture (PIP) - END -------------------- */


/*  function startVideoStream() {
navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(stream => {
    videoElement.srcObject = stream;
    videoElement.play();
  })
  .catch(err => {
    startBtn.disabled = false;
    blurBtn.disabled = true;
    stopBtn.disabled = true;
    alert(`Following error occured: ${err}`);
  });
}*/

blurBtn.addEventListener('click', e => {
	console.log("Blur button clicked");
	blurBtn.hidden = true;
	unblurBtn.hidden = false;

	selfvideo.hidden = true;
	canvas.hidden = false;

	loadBodyPix();
});

unblurBtn.addEventListener('click', e => {
	console.log("Unblur button clicked");
	blurBtn.hidden = false;
	unblurBtn.hidden = true;

	videoElement.hidden = false;
	canvas.hidden = true;
});

function loadBodyPix() {
  console.log("main - loadBodyPix");

	var options = {
	  multiplier: 0.75,
	  stride: 16,
	  quantBytes: 4
	}
	bodyPix.load(options)
	  .then(net => perform(net))
	  .catch(err => console.log(err))
}

async function perform(net) {
	while (blurBtn.hidden) {
	  const segmentation = await net.segmentPerson(selfvideo);

	  const backgroundBlurAmount = 6;
	  const edgeBlurAmount = 2;
	  const flipHorizontal = true;

	  bodyPix.drawBokehEffect(
	    canvas, selfvideo, segmentation, backgroundBlurAmount,
	    edgeBlurAmount, flipHorizontal);
	}
}

/* -------------------- CallStats - START -------------------- */
// callStats.addEventListener('click', e => {
function initialiseCallStats(pcObject){
  console.log("CallStat button clicked");

  //initialize the app with application tokens
  var AppID     = "468948303";
  var AppSecret = "sDcYsqQkO25I:WCIYaqj5sXu2uruyNyT3cH6qlUu4PAgWHSKZZLIeXF0=";
  var localUserID = "abc123";
  var remoteUserID = "xyz123";
  var csInitCallback;
  var csStatsCallback;
  var configParams;
  var conferenceID = "m.ncal.med.0.0.1111.2222";

  // callStats();
  callstats = new callstats();
  //localUserID is generated or given by the origin server
  callstats.initialize(AppID, AppSecret, localUserID, csInitCallback, csStatsCallback, configParams);
  
  /*function csInitCallback(csError, csErrMsg) {
    console.log("Status: errCode= " + csError + " errMsg= " + csErrMsg ); }
  }*/
  // console.log("pcObject: " +pcObject);

  function pcCallback (err, msg) {
    console.log("Monitoring status: "+ err + " msg: " + msg);
  };

  function createOfferError(err) {
    callstats.reportError(pcObject, conferenceID, callstats.webRTCFunctions.createOffer, err);
  }

  // pcObject is created, tell callstats about it
  // pick a fabricUsage enumeration, if pc is sending both media and data: use multiplex.
  var usage = callstats.fabricUsage.multiplex;
  var fabricAttributes = {
    remoteEndpointType:   callstats.endpointType.peer,
    fabricTransmissionDirection:  callstats.transmissionDirection.sendrecv
    };

  // remoteUserID is the recipient's userID
  // conferenceID is generated or provided by the origin server (webrtc service)
  // pcObject is created, tell callstats about it
  // pick a fabricUsage enumeration, if pc is sending both media and data: use multiplex.
  callstats.addNewFabric(pcObject, remoteUserID, usage, conferenceID, fabricAttributes, pcCallback);

  // let the "negotiationneeded" event trigger offer generation
  /*pcObject.onnegotiationneeded = function () {
    // create offer
    pcObject.createOffer().then(
      localDescriptionCreatedCallback,
      createOfferErrorCallback
    );
  }*/
}
// });

/* -------------------- CallStats - END -------------------- */
