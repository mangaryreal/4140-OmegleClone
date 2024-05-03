import React, { useState, useRef, useEffect, useCallback, memo }from 'react'
import TextMessage from './TextMessage'
import io from 'socket.io-client';

const TextChat = memo((props) => {
  const username = props.username
  const roomSize = props.roomSize
  const joinChat = props.joinChat
  const userID = parseInt(props.userID)
  const disabled = props.disabled

  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef();
  const [roomID, setRoomID] = useState(0)
  const [allUsers, setAllUsers] = useState([]); 

  const [message, setMessage] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);

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
  
      socketRef.current.on("new user joined", a => {
        console.log("new user joined")
        console.log(a);
        console.log("new user joined end")
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
  }, [joinChat, roomSize, userID, username, setRoomID, setAllUsers]);

  useEffect(() => {
    const disconnectTextChat = () => {
      socketRef.current.emit("disconnectTextChat", roomID, userID);
      socketRef.current.disconnect();
    };

    socketRef.current.on("userLeft", uname => {
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

  return (
    <div style={{ width: '100%', height: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', margin: "20px 0"}}>
        <div style={{height: "120px"}}>
          {joinChat && allUsers.map((user) => (
            <div style={{display: "grid", height: "20px", gridTemplateColumns:"80% 20%", margin:"5px 0"}}>
              <p style={{height: "20px"}}>{user.username}</p>
              <button style={{height: "20px", alignSelf:"center"}}>Report</button>
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
    </div>
  )
})

export default TextChat