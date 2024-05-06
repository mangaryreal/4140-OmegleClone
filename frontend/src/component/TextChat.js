import React, { useState, useRef, useEffect, useCallback, memo }from 'react'
import TextMessage from './TextMessage'
import io from 'socket.io-client';
import {useNavigate} from "react-router-dom"

const TextChat = memo((props) => {
  const navigate = useNavigate()

  const username = props.username
  const roomSize = props.roomSize
  const joinChat = props.joinChat
  const userID = props.userID
  const disabled = props.disabled

  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef();
  const [roomID, setRoomID] = useState(0)
  const [allUsers, setAllUsers] = useState([]); 

  const [message, setMessage] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const [disabledButtons, setDisabledButtons] = useState([]);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  useEffect(() => {
    socketRef.current = io('http://localhost:3001'); 
  }, )

  useEffect(() => {
    const disconnectTextChat = () => {
      socketRef.current.emit("disconnectTextChat", roomID, userID);
      socketRef.current.disconnect();
    };
  
    if (joinChat) {
      socketRef.current.emit("join room", roomSize, userID, username, "text");
  
      socketRef.current.on("all users", (users, roomid) => {
        setRoomID(roomid);
        const message = "You join a chat";
        const k = "Server";
        const newMessage = {
          username: k,
          message,
          userID: 0
        };
        setArrivalMessage(newMessage);
        setAllUsers(prevUsers => [...prevUsers, ...users]);
      });

      socketRef.current.on("banned", () => {
        disconnectTextChat()
        socketRef.current.disconnect(); 
        document.cookie = `Omeglejwtsign=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        navigate("/banned")
      })
  
      socketRef.current.on("new user joined", a => {
        if (a.username === null) return;
        setAllUsers(prevUsers => [...prevUsers, a]);
        const message = a.username + " join the chat";
        const k = "Server";
        const newMessage = {
          username: k,
          message,
          userID: 0
        };
        setArrivalMessage(newMessage);
      });
  
      socketRef.current.on("userLeftDisconnect", () => {
        console.log("someone disconnecting");
        setAllUsers([]);
      });
    } else {
      disconnectTextChat();
    }
  
    return () => {
      // socketRef.current.disconnect();
    };
  }, [joinChat, roomSize, userID, username, setRoomID, setAllUsers, navigate]);

  useEffect(() => {
    const disconnectTextChat = () => {
      socketRef.current.emit("disconnectTextChat", roomID, userID);
      socketRef.current.disconnect();
    };

    socketRef.current.on("userLeft", uname => {
      if (uname.username === null) return;
      const message = uname + " left the chat"
      const k = "Server"
      const newMessage = {
        username: k,
        message,
        userID: 0
      };
      setArrivalMessage(newMessage)

      setAllUsers(prevUsers => prevUsers.filter(user => user.username !== uname));
    })
  
    return () => {
      setMessage([])
      disconnectTextChat();
      setAllUsers([])
      setDisabledButtons([])
    };
  }, [joinChat, roomID, userID, setArrivalMessage]);

  useEffect(() => {
    // if (socketRef.current && joinChat) {
      socketRef.current.on("new message", (username, message, userID) => {
        const newMessage = {
          username,
          message,
          userID
        };
        setArrivalMessage(newMessage)
      });
    // }
  }, [joinChat, setArrivalMessage]);

  useEffect(() => {
    arrivalMessage && setMessage((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  const handleSendMessage = useCallback((e) => {
      e.preventDefault();
      if (inputValue.trim() === '') {
        return; // Return early if the input value is empty or contains only whitespace
      }
    
      const message = inputValue.trim();
  
      socketRef.current.emit('send message', username, message, userID);
      setInputValue('');
    }, [inputValue, username, userID])

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
    <div style={{ width: '100%', height: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', margin: "20px 0"}}>
        <div style={{height: "120px"}}>
          {joinChat && allUsers.map((user) => (
            <div style={{ display: "grid", height: "20px", gridTemplateColumns: "80% 20%", margin: "5px 0" }}>
            <p style={{ height: "20px" }}>{user.username}</p>
            <button className='report' onClick={() => handleReportMenu(user.username)} style={{ height: "20px", alignSelf: "center" }} disabled={disabledButtons.includes(user.username)}>Report</button>
          </div>
          ))}
        </div>
        <div style={{ height: "300px", overflow: "auto", marginBottom: '10px' }}>
          {message.map((message, index) => (
            <TextMessage key={index} sender={message.username} message={message.message} />
          ))}
        </div>
        <div style={{display: "flex", justifyContent: "center"}}>
          <input 
            className="chatInput" 
            placeholder='Type a message' 
            autoComplete='off'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}></input>
          <button className='sendButton' onClick={handleSendMessage} disabled={disabled}>Send</button>
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
                Report reason:
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
  )
})

export default TextChat