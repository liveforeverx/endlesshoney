// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import {Socket, Presence} from "phoenix"

let socket = new Socket("/socket", {
  params: {user_id: guid()}
})

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function renderOnlineUsers(presences) {
  let response = "";

  Presence.list(presences, (id, {metas: [first, ...rest]}) => {
    let count = rest.length + 1
    response += `<br>${id} (count: ${count})</br>`
  });

  document.querySelector("#uids").innerHTML = response;
}

socket.connect()
let presences = {}
let channel = socket.channel("call", {})

channel.on("presence_state", state => {
  presences = Presence.syncState(presences, state)
  renderOnlineUsers(presences)
})

channel.on("presence_diff", diff => {
  presences = Presence.syncDiff(presences, diff)
  renderOnlineUsers(presences)
})

channel.join()
  .receive("ok", () => { console.log("Successfully joined call channel") })
  .receive("error", () => { console.log("Unable to join") })


let localStream, peerConnection;
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let connectButton = document.getElementById("connect");
let callButton = document.getElementById("call");
let hangupButton = document.getElementById("hangup");

hangupButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
hangupButton.onclick = hangup;

function connect() {
  console.log("Requesting local stream");
  navigator.getUserMedia({audio:true, video:true}, gotStream, error => {
       console.log("getUserMedia error: ", error);
   });
}

function gotStream(stream) {
  console.log("Received local stream");
  localVideo.src = URL.createObjectURL(stream);
  localStream = stream;
  setupPeerConnection();
}

function setupPeerConnection() {
  connectButton.disabled = true;
  callButton.disabled = false;
  hangupButton.disabled = false;
  console.log("Waiting for call");

  let servers = {
    "iceServers": [{
      "url": "stun:stun.l.google.com:19302"
    }]
  };

  peerConnection = new RTCPeerConnection(servers);
  console.log("Created local peer connection");
  peerConnection.onicecandidate = gotLocalIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;
  peerConnection.addStream(localStream);
  console.log("Added localStream to localPeerConnection");
}

function call() {
  callButton.disabled = true;
  console.log("Starting call");
  peerConnection.createOffer(gotLocalDescription, handleError);
}

function gotLocalDescription(description){
  peerConnection.setLocalDescription(description, () => {
      channel.push("message", { body: JSON.stringify({
              "sdp": peerConnection.localDescription
          })});
      }, handleError);
  console.log("Offer from localPeerConnection: \n" + description.sdp);
}

function gotRemoteDescription(description){
  console.log("Answer from remotePeerConnection: \n" + description.sdp);
  peerConnection.setRemoteDescription(new RTCSessionDescription(description.sdp));
  peerConnection.createAnswer(gotLocalDescription, handleError);
}

function gotRemoteStream(event) {
  remoteVideo.src = URL.createObjectURL(event.stream);
  console.log("Received remote stream");
}

function gotLocalIceCandidate(event) {
  if (event.candidate) {
    console.log("Local ICE candidate: \n" + event.candidate.candidate);
    channel.push("message", {body: JSON.stringify({
        "candidate": event.candidate
    })});
  }
}

function gotRemoteIceCandidate(event) {
  callButton.disabled = true;
  if (event.candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    console.log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}

channel.on("message", payload => {
  let message = JSON.parse(payload.body);
  if (message.sdp) {
    gotRemoteDescription(message);
  } else {
    gotRemoteIceCandidate(message);
  }
})

function hangup() {
  console.log("Ending call");
  peerConnection.close();
  localVideo.src = null;
  peerConnection = null;
  hangupButton.disabled = true;
  connectButton.disabled = false;
  callButton.disabled = true;
}

function handleError(error) {
  console.log(error.name + ": " + error.message);
}
