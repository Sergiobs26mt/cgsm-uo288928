import adapter from 'webrtc-adapter';

let localStream,            // Local stream
    localPeerConnection,    // RTC local peer
    remotePeerConnection;   // RTC remote peer
const offerOptions = {        // The options to create the offer
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

const localVideo = document.getElementById( 'localVideo' );
const remoteVideo = document.getElementById( 'remoteVideo' );
const startButton = document.getElementById( 'startButton' );
const callButton = document.getElementById( 'callButton' );
const hangupButton = document.getElementById( 'hangupButton' );

// Initial state of the buttons
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

// Call handlers
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

function start() {
    startButton.disabled = true;
    navigator.mediaDevices.getUserMedia({
        audio: true, // We capture audio and video as requested
        video: true
    })
    .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
        callButton.disabled = false;
    })
    .catch((error) => {
        console.error('Error in getUserMedia:', error);
    });
}

function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;

    // No STUN/TURN servers
    const servers = null;

    // Local peer of the connection (caller)
    //   - create the local peer
    //   - bind the handler for receiving ICE candidates
    localPeerConnection = new RTCPeerConnection( servers );
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

    // The same for the remote peer (callee)
    // We are calling ourselves
    //    - create the remote peer
    //    - bind the handler for receiving ICE candidates
    //    - bind the handler for receiving the counterpart stream
    remotePeerConnection = new RTCPeerConnection( servers );
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ontrack = gotRemoteTrack;

    // Add local stream to the connection. This will trigger the onaddstream event
    // in the other side (the remote, callee)
    localStream.getTracks().forEach( track => localPeerConnection.addTrack( track, localStream ) );

    // Start negotiation: the description depends on the streams added to the connection
    // This description is requested asynchronously
    localPeerConnection.createOffer( offerOptions ).then( gotLocalDescription );
}

function gotLocalDescription( description ){
    // The multimedia configuration offered by the caller (local peer) is received
    localPeerConnection.setLocalDescription( description );

    //
    // This description (offer) would be sent using some signaling mechanism to the other side
    //

    // Remote peer received the offer from the caller
    remotePeerConnection.setRemoteDescription( description );
    // Create an answer for the offer
    remotePeerConnection.createAnswer( ).then( gotRemoteDescription );
}

function gotRemoteDescription( description ){
    // The multimedia configuration as an answer for the offer y received
    remotePeerConnection.setLocalDescription( description );

    //
    // This answer would be sent using some signaling mechanism to the other side
    //

    localPeerConnection.setRemoteDescription( description );
}

function gotLocalIceCandidate( event ){
    // New ICE candidate
    if (event.candidate) {
        remotePeerConnection.addIceCandidate( new RTCIceCandidate( event.candidate ) );
    }
}

function gotRemoteIceCandidate( event ){
    // New ICE candidate
    if (event.candidate) {
        localPeerConnection.addIceCandidate( new RTCIceCandidate( event.candidate ) );
    }
}

function gotRemoteTrack( event ){
    // New remote stream
    remoteVideo.srcObject = event.streams[0];
}

function hangup() {
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    
    hangupButton.disabled = true;
    callButton.disabled = false;
}
