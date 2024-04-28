import React, { useState } from 'react'
import VideoStreaming from '../component/videoStreaming';
import Buttons from '../component/buttons';

const Main = () => {
  const [joinChat, setJoinChat] = useState(false)
  const [roomSize, setRoomSize] = useState(2)

  const handleJoinChat = () => {
    setJoinChat(!joinChat)
    // return !joinChat
  }

  const handleRoomSize = (size) => {
    setRoomSize(size)
  }

  return (
    <div className='screen'>
      <div className="title">
        <h1>Omegle Clone</h1>
      </div>
      <div className='main'>
        <VideoStreaming joinChat={joinChat} roomSize={roomSize}></VideoStreaming>
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
