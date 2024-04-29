import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer'

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
      props.peer.on("stream", stream => {
          ref.current.srcObject = stream;
      })
  }, [props.peer]);

  return (
      <video className="video-grid" playsInline autoPlay ref={ref}></video>
  );
}

const VideoStreaming = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomSize = props.roomSize
    const joinChat = props.joinChat
    const username = props.username
    const userID = props.userID

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:3001/");
      
        const handleBeforeUnload = () => {
            socketRef.current.disconnect();
        
            if (userVideo.current && userVideo.current.srcObject) {
                const tracks = userVideo.current.srcObject.getTracks();
                if (tracks.length > 0) {
                  tracks.forEach(track => track.stop()); // Stop user's media stream
                }
            }
        
            peersRef.current.forEach(peer => peer.peer.destroy());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
      
        let stream = null;
        if (joinChat) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(str => {
            stream = str;
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomSize, userID, username);
            socketRef.current.on("all users", users => {
              console.log("all users")
              const peers = [];
              users.forEach(user => {
                const peer = createPeer(user.socketID, socketRef.current.id, stream);
                peersRef.current.push({
                  peerID: user.socketID,
                  peer,
                })
                peers.push(peer);
              })
              setPeers(peers);
            })
      
            socketRef.current.on("user joined", payload => {
              console.log("all users")
              const peer = addPeer(payload.signal, payload.callerID, stream);
              peersRef.current.push({
                peerID: payload.callerID,
                peer,
              })
      
              setPeers(users => [...users, peer]);
            });
      
            socketRef.current.on("receiving returned signal", payload => {
              console.log("all users")
              const item = peersRef.current.find(p => p.peerID === payload.id);
              item.peer.signal(payload.signal);
            });
      
            socketRef.current.on("userLeft", () => {
              console.log("someone disconnecting")
              setPeers([])
            })
          })
        } else {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(str => {
            stream = str;
            userVideo.current.srcObject = stream;
          })
        }
      
        return () => {
          socketRef.current.disconnect(); // Disconnect socket connection
          handleBeforeUnload()
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, [joinChat, roomSize, userID, username]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

  return (
    <div className="videos" style={peers.length > 0 ? {display:"grid"} : {display: "flex"}}>
      {<video className="video-grid" playsInline muted ref={userVideo} autoPlay />}
      {joinChat && peers.map((peer, index) => (
        <div>
          <Video key={index} peer={peer}></Video>
          <div style={{justifySelf: 
          "center"}}>
            <button>Report</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoStreaming;