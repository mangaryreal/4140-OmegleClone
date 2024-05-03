import React, { useState, useEffect, useRef, memo } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer'

const Video = memo((props) => {
  const ref = useRef();

  useEffect(() => {
      props.peer.on("stream", stream => {
          ref.current.srcObject = stream;
      })
  }, [props.peer]);

  return (
      <video className="video-grid" playsInline autoPlay ref={ref}></video>
  );
})

const VideoStreaming = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomSize = props.roomSize
    const joinChat = props.joinChat
    const username = props.username
    const userID = parseInt(props.userID)
    const [roomID, setRoomID] = useState(0)
    const [allUsers, setAllUsers] = useState([])

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:3001/");
      
        const handleBeforeUnload = () => {
          setAllUsers([])
          socketRef.current.emit("disconnectTextChat", roomID, userID);
          socketRef.current.disconnect();
      
          if (userVideo.current && userVideo.current.srcObject) {
            const tracks = userVideo.current.srcObject.getTracks();
            if (tracks.length > 0) {
              tracks.forEach(track => track.stop()); // Stop user's media stream
            }
          }
      
          peersRef.current.forEach(peer => {
            if (peer.peer.destroyed === false) {
              peer.peer.destroy();
            }
          });
        };
      
        window.addEventListener('beforeunload', handleBeforeUnload);
      
        let stream = null;
        if (joinChat) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(str => {
            stream = str;
            userVideo.current.srcObject = stream;

            socketRef.current.emit("join room", roomSize, userID, username, "video");

            socketRef.current.on("all users", (users, roomid) => {
              setRoomID(roomid)
              console.log("all users")
              console.log(users)
              console.log("all users end")
              const peers = [];
              users.forEach(user => {
                setAllUsers(allUsers => [...allUsers, user])
                const peer = createPeer(user.socketID, socketRef.current.id, stream);
                peersRef.current.push({
                  peerID: user.socketID,
                  peer,
                })
                peers.push(peer);
              })
              setPeers(peers);
            })

            socketRef.current.on("new user joined", (a)=> {
              console.log(a)
              setAllUsers(allUsers => [...allUsers, a])
            })
      
            socketRef.current.on("user joined", payload => {
              const peer = addPeer(payload.signal, payload.callerID, stream);
              peersRef.current.push({
                peerID: payload.callerID,
                peer,
              })
              setPeers(users => [...users, peer]);
            });
      
            socketRef.current.on("receiving returned signal", payload => {
              const item = peersRef.current.find(p => p.peerID === payload.id);
              item.peer.signal(payload.signal);
            });
      
            socketRef.current.on("userLeftDisconnect", () => {
              console.log("someone disconnecting")
              setPeers([])
              setAllUsers([])
            })

            socketRef.current.on("userLeft", (username) => {
              console.log(username + " disconnecting")
              setPeers([])
              setAllUsers([])
            })
          })
        } else {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(str => {
            stream = str;
            userVideo.current.srcObject = stream;
          })
          socketRef.current.emit("disconnectTextChat", roomID, userID);
        }
      
        return () => {
          socketRef.current.disconnect(); // Disconnect socket connection
          handleBeforeUnload()
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, [joinChat, roomSize, userID, username, setRoomID, setAllUsers]);

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
    <div>
      <div className="videos" style={peers.length > 0 ? {display:"grid"} : {display: "grid"}}>
        <div>
          <video className="video-grid" playsInline muted ref={userVideo} autoPlay />
          <p>Self</p>
        </div>
        {joinChat && peers.map((peer, index) => (
          <div>
            <Video key={index} peer={peer}></Video>
            <p key={index}>{allUsers[index]?.username}</p>
          </div>
        ))}
      </div>
      {/* {joinChat && allUsers.map((user, index) => (
        <div>
          <p key={index}>{user.username}</p>
        </div>
      ))} */}
    </div>
  );
};

export default VideoStreaming;