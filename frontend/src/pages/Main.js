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
  const [switchChat, setSwitchChat] = useState(false);
  const [textMode, setTextMode] = useState(false)

  const handleJoinChat = () => {
    setJoinChat(!joinChat)
  }

  function getCookie(name) {
    const cookieString = decodeURIComponent(document.cookie);
    const cookies = cookieString.split(';');
  
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
  
      // Check if the cookie starts with the provided name
      if (cookie.startsWith(name + '=')) {
        // Get the value by removing the name and equal sign
        return cookie.substring(name.length + 1);
      }
    }
  
    return null;
  }

  function chekcAuth () {
    setUsername(getCookie("OmegleClone"))
    setUserID(getCookie("OmegleCloneID"))

    if (username === null || userID === null){
      navigate("/login")
    }
  }
  
  useEffect(() => {
    chekcAuth()
  })

  const handleRoomSize = (size) => {
    setRoomSize(size)
  }

  const handleSwitchChat = () => {
    setSwitchChat(!switchChat)
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
            userID={userID}
            switchChat={switchChat}
            handleSwitchChat={handleSwitchChat}>

            </VideoStreaming>
          )}
          <div className='panel'>
              <Buttons 
                handleJoinChat={handleJoinChat} 
                handleRoomSize={handleRoomSize} 
                handleSwitchChat={handleSwitchChat} 
                handleTextMode={handleTextMode}
              ></Buttons>
            <div className='chatRoom'>
              {/* <canvas></canvas> */}
              <TextChat></TextChat>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Main
