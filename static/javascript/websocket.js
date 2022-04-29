var username = document.querySelector(".user-profile").dataset.name;
var user_avatar = document.querySelector(".user-profile").dataset.avatar;

let localVideo = document.querySelector('#localVideo');
let remoteVideo = document.querySelector('#remoteVideo');

let remoteRTCMessage;

let iceCandidatesFromCaller = [];
let peerConnection;
let remoteStream;
let localStream;

let callInProgress = false;

var pcConfig = {
"iceServers":
    [
        // { "url": "stun:stun.jap.bloggernepal.com:5349" },
        // {
        //     "url": "turn:turn.jap.bloggernepal.com:5349",
        //     "username": "guest",
        //     "credential": "somepassword"
        // },
        { "url": "stun:3.108.252.112" },
        {
            "url": "turn:3.108.252.112",
            "username": "cmn",
            "credential": "cmn"
        }
        // {"url": "stun:stun.l.google.com:19302"}
    ]
};

// Set up audio and video regardless of what devices are present.
let sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};


var chatSocket = new ReconnectingWebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
);

chatSocket.onmessage = function(e){
    var data = JSON.parse(e.data);
    // alert("onmessage : \nData="+data)

    if (data['command'] === 'messages'){
        // alert("onmessage -> command=messages");
        for (let i=0; i<data['messages'].length; i++){
            createMessage(data['messages'][i]);
        }
    }
    else if (data['command'] === 'new_message'){
        createMessage(data['message']);
    }
    else if(data['command'] == 'call_received'){
        // alert("on message: Call Received");
        // alert(data.data.callerAvatar)
        onNewCall(data.data)
    }
    else if(data['command'] == 'call_declined'){
        // alert("on message: Call Declined");
        onCallDeclined(data.data)
    }
    else if(data['command'] == 'call_answered'){
        // alert("on message: Call Answered");
        onCallAnswered(data.data)
    }
    else if(data['command'] == 'call_ended'){
        // alert("on message: Call Ended");
        onCallEnded(data.data)
    }
    else if(data['command'] == 'ICEcandidate'){
        // alert("on message: ICECandidate");
        onICECandidate(data.data)
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-send').click();
    }
};

document.querySelector('#chat-message-send').onclick = function(e) {
    var messageInputDom = document.querySelector('#chat-message-input');
    var message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'command': 'new_message',
        'message': message,
        'sender': username,
        'receiver': selected_contact
    }));
    messageInputDom.value = '';
};

function fetchMessages(){
    chatSocket.send(JSON.stringify({
        'command': 'fetch_messages'
    }));
}

function createMessage(data){
    // alert(data);
    var sender = data['sender'];
    var receiver = data['receiver'];
    var message = data['message'];
    var timestamp = data['timestamp'];
    
    timestamp = timestamp.replace(' ','T');
    let time = new Date(timestamp)
    timestamp = time.toLocaleString()


    if (((sender==username)||(sender==selected_contact)) && ((receiver==username)||(receiver==selected_contact))){
        var msgListTag = document.createElement('li');
        var imgTag = document.createElement('img');
        var pTag = document.createElement('p');
        var chatName;


        if (sender == username){
            msgListTag.className = 'chat-right';
            var userAvatar = user_avatar;
            // To remove added amp; which is done automatically by URLAction
            userAvatar = userAvatar.replaceAll("&amp;", "&");
            imgTag.src = userAvatar;
            chatName = username;
        }
        else{
            msgListTag.className = 'chat-left';
            imgTag.src = selected_contact_avatar;
            chatName = selected_contact;
        }

        var chatAvatarDiv = document.createElement('div');
        chatAvatarDiv.className = 'chat-avatar';
        var chatNameDiv = document.createElement('div')
        chatNameDiv.className = 'chat-name';
        chatNameDiv.textContent = chatName;
        chatAvatarDiv.appendChild(imgTag);
        chatAvatarDiv.appendChild(chatNameDiv);

        var chatTextWrapperDiv = document.createElement('div');
        chatTextWrapperDiv.className = 'chat-text-wrapper';
        var chatTextDiv = document.createElement('div');
        chatTextDiv.className = 'chat-text';
        var pTag = document.createElement('p');
        pTag.textContent = message;
        var chatHourDiv = document.createElement('div');
        chatHourDiv.className = 'chat-hour';
        chatHourDiv.textContent = timestamp;
        chatTextDiv.append(pTag);
        chatTextDiv.append(chatHourDiv);
        chatTextWrapperDiv.append(chatTextDiv);
        
        msgListTag.append(chatAvatarDiv);
        msgListTag.append(chatTextWrapperDiv);

        document.querySelector('.chat-box').appendChild(msgListTag);

        // To scroll to the bottom of the page when a message is created
        const message_div = document.querySelector('#chatting-scroll')
        message_div.scrollTop = message_div.scrollHeight
    }
};


const onNewCall = (data) =>{
    // alert("In onNewCall");
    // alert("const -> onNewCall(data) :data.caller()="+data.caller+" calling: "+data.calling)
    // when other called you, show answer button
    // alert(data.caller+": "+data.callerAvatar);
    if (data.calling == username){
        $('#incomingVideoCall').modal('toggle');
        document.getElementById("caller-user-avatar").src = data.callerAvatar;
        document.getElementById("caller-user-name").innerHTML = data.caller;
        document.getElementById('videocall-calling-avatar').src = data.callerAvatar;
        document.getElementById("videocall-calling-name").innerHTML = data.caller;
    }

    caller = data.caller;
    calling = data.calling;
    remoteRTCMessage = data.rtcMessage

    // document.getElementById("profileImageA").src = baseURL + callerProfile.image;
    // document.getElementById("callerName").innerHTML = otherUser;
    // document.getElementById("call").style.display = "none";
    // document.getElementById("answer").style.display = "block";
}

const onCallDeclined = (data) =>{
    // alert(data.caller+"=="+username+"?")
    if (data.caller == username) {
        $('#makingVideoCall').modal('hide');
        // alert(data.reason)
        // if(alert("Called Declined: "+data.reason)){}
        // else{
        //     window.location.reload(); 
        // }
        // confirm("Called Declined: "+data.reason)
        // if(confirm("Called Declined: "+data.reason)){
        //     window.location.reload();  
        // }
        // preventDefault();
        // alert("Called Declined: "+data.reason);
        if(!alert("Call Declined: "+data.reason)){window.location.reload();}
        // alert("Called Declined: ");
        // window.location.reload();
    }
    // window.location.reload();
    // localVideo.getTracks()[0].stop();
    // localVideo[0].stop();
    // remoteVideo[0].stop();
    // localVideo.pause()
    // remoteVideo.pause()
    //when other called you
    //show answer button

    // otherUser = data.caller;
    // remoteRTCMessage = data.rtcMessage

    // document.getElementById("profileImageA").src = baseURL + callerProfile.image;
    // document.getElementById("callerName").innerHTML = otherUser;
    // document.getElementById("call").style.display = "none";
    // document.getElementById("answer").style.display = "block";
}

const onCallAnswered = (data) =>{
    // alert(data.callingAvatar)
    // when other accept our call
    // alert("const -> onCallAnswered(): "+data.caller);
    // $('#makingVideoCall').modal('hide');
    // $('#inVideoCall').modal('toggle');

    if (data.caller == username){
        $('#makingVideoCall').modal('hide');
        $('#inVideoCall').modal('toggle');
        // document.getElementById('videocall-caller-avatar').src = calling-avatar;
        document.getElementById('videocall-calling-avatar').src = data.callingAvatar;
        document.getElementById('videocall-calling-name').innerHTML = data.calling;
    }

    remoteRTCMessage = data.rtcMessage;
    peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
    // document.getElementById("calling").style.display = "none";
    // alert("Call Started, They Answered");
    console.log("Call Started. They Answered");
    console.log(data.caller);
    // console.log(pc);
    callProgress()
}

const onCallEnded = (data) =>{
    if (data.otherUser == username){
        alert("Call Ended");
        window.location.reload();
    }
}

const onICECandidate = (data) =>{
    // alert("const -> onICECandidate")
    console.log(data);
    console.log("GOT ICE candidate");

    let message = data.rtcMessage

    let candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
    });

    if (peerConnection) {
        console.log("ICE candidate Added");
        peerConnection.addIceCandidate(candidate);
    } else {
        console.log("ICE candidate Pushed");
        iceCandidatesFromCaller.push(candidate);
    }

}

function call(){
    // alert("call(): "+selected_contact);
    $('#makingVideoCall').modal('toggle');
    document.getElementById("calling-user-avatar").src = selected_contact_avatar;
    document.getElementById("calling-user-name").innerHTML = selected_contact
    beReady()
    .then(bool => {
        processCall(selected_contact);
    })
}

function answer() {
    // alert("answer()")
    $('#incomingVideoCall').modal('hide');
    $('#inVideoCall').modal('toggle');
    //do the event firing
    beReady()
        .then(bool => {
            processAccept();
        })
    // document.getElementById("answer").style.display = "none";
}

function beReady() {
    // alert("beReady()");
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        return createConnectionAndAddStream()
    })
    .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
        window.location.reload();
    });
}

function call_rejected(){
    chatSocket.send(JSON.stringify({
        'command': 'call_rejected',
        'data' : {
            'caller': caller,
            'calling': calling,
            'rtcMessage': remoteRTCMessage
        }
    }));
    if (username == calling){
        window.location.reload();
    }
}

function end_call(){
    // alert("In End Call/nUsername: "+username+"/nCaller: "+caller+"/nCalling: "+calling)
    var otherUser;
    if (username == caller){
        otherUser = calling;
    }
    else{
        otherUser = caller;
    }
    // alert("Other User: "+otherUser)
    chatSocket.send(JSON.stringify({
        'command': 'end_call',
        'data' : {
            'otherUser': otherUser,
            'rtcMessage': remoteRTCMessage
        }
    }));
    if (username == caller || username == calling){
        alert("Call Ended")
        window.location.reload();
    }
}

function createConnectionAndAddStream() {
    // alert("createConnectionAndAddStream()");
    createPeerConnection();
    peerConnection.addStream(localStream);
    return true;
}

function createPeerConnection() {
    try {
        // alert("createPeerConnection() :start")
        peerConnection = new RTCPeerConnection(pcConfig);
        // peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = handleIceCandidate;
        peerConnection.onaddstream = handleRemoteStreamAdded;
        peerConnection.onremovestream = handleRemoteStreamRemoved;
        // console.log('Created RTCPeerConnnection');
        // alert("createPeerConnection() :Created RTCPeerConnnection")
        return;
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        // alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function processCall(selected_contact) {
    // alert("processCall()")
    peerConnection.createOffer((sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription);
        // alert("processCall() is calling sendCall() with sessionDescription="+sessionDescription)
        sendCall({
            caller: username,
            calling: selected_contact,
            rtcMessage: sessionDescription
        })
    }, (error) => {
        console.log("Error");
    });
}

function processAccept() {
    // alert("processAccept")
    peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
    peerConnection.createAnswer((sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription);

        if (iceCandidatesFromCaller.length > 0) {
            //I am having issues with call not being processed in real world (internet, not local)
            //so I will push iceCandidates I received after the call arrived, push it and, once we accept
            //add it as ice candidate
            //if the offer rtc message contains all thes ICE candidates we can ingore this.
            for (let i = 0; i < iceCandidatesFromCaller.length; i++) {
                //
                let candidate = iceCandidatesFromCaller[i];
                console.log("ICE candidate Added From queue");
                try {
                    peerConnection.addIceCandidate(candidate).then(done => {
                        console.log(done);
                    }).catch(error => {
                        console.log(error);
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            iceCandidatesFromCaller = [];
            console.log("ICE candidate queue cleared");
        } else {
            console.log("No Ice candidate in queue");
        }

        answerCall({
            caller: caller,
            calling: calling,
            rtcMessage: sessionDescription
        })

    }, (error) => {
        console.log("Error");
    })
}

function callProgress() {
    // alert("callProgress()");
    // document.getElementById("videos").style.display = "block";
    // document.getElementById("otherUserNameC").innerHTML = otherUser;
    // document.getElementById("inCall").style.display = "block";
    callInProgress = true;
}

function handleIceCandidate(event) {
    // alert("handleIceCandidate(event)\nevent="+event)
    if (event.candidate) {
        console.log("Local ICE candidate");
        // alert("handleIceCandidate(event) :SendingICEcandidate\nuser="+selected_contact+"\nlabel="+event.candidate.sdpMLineIndex+"\nid="+event.candidate.sdpMid+"\ncandidate="+event.candidate.candidate)
        sendICEcandidate({
            user: selected_contact,
            rtcMessage: {
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            }
        })
    } else {
        console.log('End of candidates.');
    }
}

function sendICEcandidate(data) {
    //send only if we have caller, else no need to
    // alert("sendICEcandidate(data) :Sending ICE candidate to servers");
    // socket.emit("ICEcandidate", data)
    chatSocket.send(JSON.stringify({
        command: 'ICEcandidate',
        data
    }));

}

function handleRemoteStreamAdded(event) {
    // alert("handleRemoteStreamAdded(event) :Remote stream added.\nEvent=", event);
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
    // alert('handleRemoteStreamRemoved :Remote stream removed. \nEvent=', event);
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
}

window.onbeforeunload = function () {
    if (callInProgress) {
        stop();
    }
};


/**
 *
 * @param {Object} data
 * @param {number} data.caller - the name of the user making the call
 * @param {number} data.calling - the name of the user being called
 * @param {Object} data.rtcMessage - the rtc create offer object
 */
function sendCall(data) {
    //to send a call
    // alert("sendCall(data) :Data="+data);
    chatSocket.send(JSON.stringify({
        command: 'call',
        data
    }));
    // document.getElementById("call").style.display = "none";
    // // document.getElementById("profileImageCA").src = baseURL + otherUserProfile.image;
    // document.getElementById("otherUserNameCA").innerHTML = otherUser;
    // document.getElementById("calling").style.display = "block";
}

/**
 *
 * @param {Object} data
 * @param {number} data.caller - the name of the user making the call
 * @param {number} data.calling - the name of the user being called
 * @param {Object} data.rtcMessage - answer rtc sessionDescription object
 */
function answerCall(data) {
    // to answer a call
    // alert("answerCall(data) :Data="+data);
    // socket.emit("answerCall", data);
    chatSocket.send(JSON.stringify({
        command: 'answer_call',
        data
    }));
    callProgress();
}