import React, { useEffect, useState } from 'react'
import VideoStreaming from '../component/videoStreaming';
import Buttons from '../component/buttons';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const [joinChat, setJoinChat] = useState(false)
  const [roomSize, setRoomSize] = useState(2)
  const navigate = useNavigate()
  const [userID, setUserID] = useState('')
  const [username, setUsername] = useState('')

  const handleJoinChat = () => {
    setJoinChat(!joinChat)
    // return !joinChat
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

  return (
    <div className='screen'>
      <div className="title">
        <h1>Omegle Clone</h1>
        <p>Welcome, {username}</p>
      </div>
      <div className='main'>
        <VideoStreaming 
          joinChat={joinChat} 
          roomSize={roomSize} 
          username={username} 
          userID={userID}>

          </VideoStreaming>
        <div className='panel'>
            <Buttons handleJoinChat={handleJoinChat} handleRoomSize={handleRoomSize}></Buttons>
          <div className='chatRoom'>
            <canvas></canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main
