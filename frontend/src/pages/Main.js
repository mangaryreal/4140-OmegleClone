import React, { useEffect, useState } from 'react'
import VideoStreaming from '../component/videoStreaming';
import Buttons from '../component/buttons';
import { useNavigate } from 'react-router-dom';
import TextChat from '../component/TextChat';

const Main = () => {
  const [joinChat, setJoinChat] = useState(false)
  const [roomSize, setRoomSize] = useState(2)
  const navigate = useNavigate()
  const [userID, setUserID] = useState('')
  const [username, setUsername] = useState('')
  const [textMode, setTextMode] = useState(true)


  const handleJoinChat = () => {
    setJoinChat(!joinChat)
  }

  const checkAuth = async () => {
    const jwtCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('Omeglejwtsign='));
    
    if (document.cookie === "" || !jwtCookie) {
      navigate("/login");
      return;
    }
  
    try {
      const jwtToken = jwtCookie.split('=')[1];
      const res = await fetch('http://localhost:3001/protected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jwtToken }),
      });
  
      if (res.ok) {
        const { decode } = await res.json();
        setUserID(decode.userID);
        console.log(decode.userID)
        setUsername(decode.username);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  useEffect(() => {
    checkAuth();
  },[])

  const handleRoomSize = (size) => {
    setRoomSize(size)
  }

  const handleTextMode = () => {
    setTextMode(!textMode)
  }


  return (
      <div className='screen'>
        <div className="title">
          <h1>Omegle Clone</h1>
          <p>Welcome, {username}</p>
        </div>
        <div className='main' style={textMode ? {gridTemplateColumns: "auto"} : {}}>
          {textMode ? null : (
            <VideoStreaming 
            joinChat={joinChat} 
            roomSize={roomSize} 
            username={username} 
            userID={userID}>

            </VideoStreaming>
          )}
          <div className='panel'>
              <Buttons 
                handleJoinChat={handleJoinChat} 
                handleRoomSize={handleRoomSize} 
                handleTextMode={handleTextMode}
              ></Buttons>
            {textMode && 
            <div className='chatRoom'>
                <TextChat
                  joinChat={joinChat} 
                  disabled={!joinChat}
                  username={username} 
                  userID={userID}
                  roomSize={roomSize} 
                ></TextChat>
            </div>}
          </div>
        </div>
      </div>
  )
}

export default Main
