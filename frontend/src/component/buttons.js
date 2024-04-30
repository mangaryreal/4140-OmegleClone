import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Buttons = ({ handleRoomSize, handleJoinChat, handleSwitchChat, handleTextMode }) => {
  const navigate = useNavigate()
  const [chatting, setChatting] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [selectedRoomSize, setSelectedRoomSize] = useState(2);
  

  const changeChatting = () => {
    setChatting(!chatting)
    handleJoinChat()
  }

  const changeTextMode = () => {
    setTextMode(!textMode)
    handleTextMode()
  }

  const handleRoomSizeChange = (event) => {
      setSelectedRoomSize(event.target.value);
      handleRoomSize(event.target.value)
  };

  const handleLogout = () => {
    deleteCookie("OmegleClone")
    deleteCookie("OmegleCloneID")
    navigate("/login")
  }

  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  return (
    <div>
      <div className='buttons'>
        {!chatting ? <button className='newChat' onClick={changeChatting}>Join chat</button> : (
          <>
            <button className='newChat' onClick={handleSwitchChat}>Switch Chat</button>
            <button className='leaveChat' onClick={changeChatting}>Leave Chat</button>
          </>
        )}
        {!chatting && <button className='textModeButton' onClick={changeTextMode}>{textMode ? "Text" : "Video"}</button>}
          <label>Room Size: </label>
          <select disabled={chatting} name='roomSize' value={selectedRoomSize} onChange={handleRoomSizeChange}>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
          </select>
      </div>
      <div style={{display: "grid", justifyContent: "center", padding: "2%"}}>
        <button className='logOutButton' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Buttons