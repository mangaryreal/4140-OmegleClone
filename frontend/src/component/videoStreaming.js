import React, { useState, useEffect, useRef,useCallback ,memo } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer'
import {useNavigate} from "react-router-dom"

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
    const userID = props.userID
    const [roomID, setRoomID] = useState(0)
    const [allUsers, setAllUsers] = useState([])
    const navigate = useNavigate()

    const [disabledButtons, setDisabledButtons] = useState([]);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
  

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:3001/");
      
        const handleBeforeUnload = () => {
          setAllUsers([])
          setDisabledButtons([])
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

            socketRef.current.on("banned", () => {
              handleBeforeUnload()
              socketRef.current.disconnect(); 
              window.removeEventListener('beforeunload', handleBeforeUnload);
              document.cookie = `Omeglejwtsign=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              navigate("/banned")
            })
      
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
              setDisabledButtons([])
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
      }, [joinChat, roomSize, userID, username, setRoomID, setAllUsers, navigate]);

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

    const handleReportMenu = useCallback((username) => {
      setSelectedUser(username);
      setShowReportPopup(true);
    }, []);

    const handleCheckboxChange = (event) => {
      const { value, checked } = event.target;
    
      if (checked) {
        setSelectedReason(value);
        setOtherReason(event.target.nextSibling.textContent);
      } else {
        setSelectedReason('');
        setOtherReason('');
      }
    };
    
    const handleOtherReasonChange = (event) => {
      const { value } = event.target;
      setSelectedReason(value);
      setOtherReason(value);
    };
    
    const toggleButtonDisabled = (username) => {
      setDisabledButtons(prevButtons => {
        const updatedButtons = [...prevButtons];
        const index = updatedButtons.indexOf(username);
        if (index === -1) {
          updatedButtons.push(username);
        } else {
          updatedButtons.splice(index, 1);
        }
        return updatedButtons;
      });
    };

    const handleReport = async (event) => {
      event.preventDefault();
    
      const requestBody = {
        report_reason: selectedReason,
        reporter_name: username,
        reported_name: selectedUser
      };
    
      const ReportSubmission = await fetch("http://localhost:3001/report", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(requestBody),
      });
    
      if (ReportSubmission.ok) {
        const resourse = await ReportSubmission.json();
        alert(resourse.message);   
        toggleButtonDisabled(resourse.reported_name);
        setShowReportPopup(false);
        if (resourse.banned === true){
          socketRef.current.emit("user banned", resourse.banned_id)
        }
      } else {
        const resource = await ReportSubmission.json();
        alert(resource.message);
      }
    };

  return (
    <div>
    <div style={{ height: "120px" }}>
    {joinChat && allUsers.map((user) => (
    <div
      key={user.socketID}
      style={{ display: "flex", alignItems: "center", margin: "5px 0" }}
    >
      <p style={{ flex: "1", height: "20px" }}>{user.username}</p>
      <button className='report' onClick={() => handleReportMenu(user.username)} style={{ height: "20px", alignSelf: "center" }} disabled={disabledButtons.includes(user.username)}>Report</button>
    </div>
    ))}
    </div>
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
        {showReportPopup && (
          <div className="popup">
            <p>You &#40;{username}&#41; are reporting {selectedUser} for</p>
            <div>
              <label>
                <input type="checkbox" name="reportReason" value="sexualContent" onChange={handleCheckboxChange} checked={selectedReason === 'sexualContent'} disabled={selectedReason !== '' && selectedReason !== 'sexualContent'} />
                Sexual content
              </label>
              <br />
              <label>
                <input type="checkbox" name="reportReason" value="violentContent" onChange={handleCheckboxChange} checked={selectedReason === 'violentContent'} disabled={selectedReason !== '' && selectedReason !== 'violentContent'} />
                Violent or repulsive content
              </label>
              <br />
              <label>
                <input type="checkbox" name="reportReason" value="hatefulContent" onChange={handleCheckboxChange} checked={selectedReason === 'hatefulContent'} disabled={selectedReason !== '' && selectedReason !== 'hatefulContent'} />
                Hateful or abusive content
              </label>
              <br />
              <label>
                <input type="checkbox" name="reportReason" value="harmfulContent" onChange={handleCheckboxChange} checked={selectedReason === 'harmfulContent'} disabled={selectedReason !== '' && selectedReason !== 'harmfulContent'} />
                Harmful or dangerous acts
              </label>
              <br />
              <label>
                Other reason:
                <input type="text" name="otherReason" value={otherReason} onChange={handleOtherReasonChange} />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button onClick={() => setShowReportPopup(false)}>Cancel</button>
              <button  onClick={handleReport} disabled={selectedReason === '' && otherReason === ''}>Report</button>
            </div>
          </div>
        )}
    </div>
  );
};

export default VideoStreaming;