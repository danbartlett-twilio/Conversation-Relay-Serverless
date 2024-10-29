// Define the bufferLength
const bufferLength = 256;

// Create a circular buffer to hold the volume levels
let localVolumeBuffer = new Array(bufferLength);
let remoteVolumeBuffer = new Array(bufferLength);
let markerBuffer = new Array(bufferLength).fill(undefined);
let bufferIndex = 0;

let sampleTime = 0;

let canvas;
let canvasContext;
let devicePixelRatio;

// Function to be called in runOnLoad() and window.onresize
function setupAudioVisualizerCanvas() {
  // Get the canvas and its context
  canvas = document.getElementById("audio-visualizer");
  canvasContext = canvas.getContext("2d");

  // Get the device pixel ratio
  devicePixelRatio = window.devicePixelRatio || 1;

  // Scale the canvas by the device pixel ratio
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  // Scale the drawing context by the same amount
  canvasContext.scale(devicePixelRatio, devicePixelRatio);

  // console.log("canvas.width: " + canvas.width + ", canvas.height: " + canvas.height + ", devicePixelRatio: " + devicePixelRatio);

  localVolumeBuffer.fill(0);
  remoteVolumeBuffer.fill(0);
}

// Function to draw the audio data
function draw() {
  // Adjust the canvas for the device pixel ratio
  const canvasHeight = canvas.height / devicePixelRatio;
  const barWidth = canvas.width / bufferLength / devicePixelRatio;

  const timeMarkerWidth = barWidth / 8;
  const externalMarkerWidth = barWidth / 4;
  const barGapWidth = barWidth / 32;
  const narrowBarWidth = barWidth - barGapWidth * 2;

  let xPosition = 0;
  let lSampleTime = 0;
  for (let i = 0; i < bufferLength; i++) {
    // The values have been scaled properly
    let localBarHeight = localVolumeBuffer[(bufferIndex + i) % bufferLength];
    let remoteBarHeight = remoteVolumeBuffer[(bufferIndex + i) % bufferLength];

    let markerValue = markerBuffer[(bufferIndex + i) % bufferLength];

    lSampleTime = ((bufferLength - sampleTime - i) * 50) % 1000; // Increment the sample time by 50ms

    const backgroundColor = "rgb(0, 0, 0)";

    // Draw the background rectangle with the selected color
    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(xPosition, 0, barWidth, canvasHeight);

    if (remoteBarHeight > 0) {
      // Draw the remote audio frequency bar in green
      // canvasContext.fillStyle = 'rgb(50, 200, 50)';
      canvasContext.fillStyle = "rgb(36, 200, 56)";
      // canvasContext.fillRect(xPosition, canvasHeight - remoteBarHeight, narrowBarWidth, remoteBarHeight);
      canvasContext.fillRect(
        xPosition + barGapWidth,
        canvasHeight - remoteBarHeight,
        narrowBarWidth,
        remoteBarHeight
      );
    }

    // Let local bar override remote bar
    if (localBarHeight > 0) {
      // Draw the local microphone frequency bar
      // canvasContext.fillStyle = 'rgb(200, 50, 50)';
      canvasContext.fillStyle = "rgb(200, 52, 36)";
      // canvasContext.fillRect(xPosition, canvasHeight - localBarHeight, barWidth, localBarHeight);
      canvasContext.fillRect(
        xPosition + barGapWidth,
        canvasHeight - localBarHeight,
        narrowBarWidth,
        localBarHeight
      );
    }

    // Draw the external marker
    if (markerValue !== undefined) {
      canvasContext.fillStyle = markerValue; // color per requested
      // canvasContext.fillStyle = 'rgb(239, 255, 0)';   // neon yellow
      canvasContext.fillRect(xPosition, 0, externalMarkerWidth, canvasHeight);
    } else if (lSampleTime === 0) {
      // at the start of each second interval, set the background edge color to white
      canvasContext.fillStyle = "rgb(211, 211, 211)";
      canvasContext.fillRect(xPosition, 0, timeMarkerWidth, canvasHeight);
    }

    xPosition += barWidth;
  }
}

// Initialize minInputVolume and maxInputVolume to the extreme opposite values
let minInputVolume = Infinity;
let maxInputVolume = -Infinity;

let minOutputVolume = Infinity;
let maxOutputVolume = -Infinity;

let externalMarker = undefined;

// Add an event listener to the "Call" button
function analyze(call) {
  console.log("Call button clicked");
  // Assuming 'call' is your Twilio Call object
  call.on("volume", function (inputVolume, outputVolume) {
    // inputVolume and outputVolume are between -100 (silence) and 0 (maximum volume)

    // only fill up to 3/4 of the canvas height
    const maxValue = (3 * canvas.height) / (4 * devicePixelRatio);

    // Update minInputVolume and maxInputVolume
    minInputVolume = Math.min(minInputVolume, inputVolume);
    maxInputVolume = Math.max(maxInputVolume, inputVolume);

    // Update minOutputVolume and maxOutputVolume
    minOutputVolume = Math.min(minOutputVolume, outputVolume);
    maxOutputVolume = Math.max(maxOutputVolume, outputVolume);

    // Map inputVolume from the range [minInputVolume, maxInputVolume] to the range [0, 255]
    let volumeLevel =
      ((inputVolume - minInputVolume) / (maxInputVolume - minInputVolume)) *
      maxValue;
    volumeLevel = Math.max(0, Math.min(maxValue, volumeLevel)); // Clamp the value between 0 and 255

    // Map outputVolume from the range [minOutputVolume, maxOutputVolume] to the range [0, 255]
    let remoteVolumeLevel =
      ((outputVolume - minOutputVolume) / (maxOutputVolume - minOutputVolume)) *
      maxValue;
    remoteVolumeLevel = Math.max(0, Math.min(maxValue, remoteVolumeLevel)); // Clamp the value between 0 and 255

    // Add the volume level to the buffer
    localVolumeBuffer[bufferIndex] = volumeLevel;

    // Add the remote volume level to the buffer and update the buffer index
    remoteVolumeBuffer[bufferIndex] = remoteVolumeLevel;

    // Add the external marker to the buffer
    if (externalMarker !== undefined) {
      markerBuffer[bufferIndex] = externalMarker;
      externalMarker = undefined;
    } else {
      // Clear it in case the buffer has rolled over
      markerBuffer[bufferIndex] = undefined;
    }

    // Update the buffer index
    bufferIndex = (bufferIndex + 1) % bufferLength;

    // Increment sampleTime
    sampleTime++;
    if (sampleTime % 20 === 0) {
      // console.log(
      //   "sampleTime: " + sampleTime + ", bufferIndex: " + bufferIndex
      // );
      // console.log("input volume", inputVolume, "output volume", outputVolume);
    }

    // Call the draw function
    draw();
  });
}

export function addMarkerToVisualizer(color) {
  console.log("adding marker to audio visualizer, color: " + color);
  if (color === "orange") {
    externalMarker = "rgb(255, 165, 0)"; // neon orange;
  } else if (color === "green") {
    externalMarker = "rgb(57, 255, 20)"; // neon orange;
  } else {
    externalMarker = "rgb(239, 255, 0)"; // neon yellow;
  }
}

const exports = {
  setupAudioVisualizerCanvas,
  addMarkerToVisualizer,
  analyze,
};

export default exports;
