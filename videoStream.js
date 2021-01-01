const { desktopCapturer, remote } = require("electron");
const fs = require("fs");
let mediaRecorder;
const recordedChunks = [];

document.getElementById("start").addEventListener("click", (e) => {
  alert("Recording Started");
  mediaRecorder.start();
});

async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFile(`vid-${Date.now()}.webm`, buffer, function (err) {
    if (err) throw err;
    alert("done");
  });
}

document.getElementById("stop").addEventListener("click", (e) => {
  mediaRecorder.stop();
});
const feed = document.getElementById("stream");
feed.style.width = "200px";

getVideoSources();

var streams = {};

document.getElementById("stream").addEventListener("change", (e) => {
  var x = document.getElementById("stream").value;
  streamFeed(streams[x]);
});

function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

async function streamFeed(feed) {
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: feed,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
  document.getElementById("videoFeed").style.width = "720px";
  document.getElementById("videoFeed").style.marginLeft = "20px";
  document.getElementById("videoFeed").srcObject = stream;
  document.getElementById("videoFeed").play();
}

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  var opp = document.createElement("option");
  opp.innerHTML = "";
  feed.appendChild(opp);
  inputSources.map((source) => {
    var op = document.createElement("option");
    if (source.name != "Hello World!") {
      streams[source.name] = source.id;
      op.innerHTML = source.name;
      feed.appendChild(op);
    }
  });
}
