import React from 'react'
import TextMessage from './TextMessage'

const TextChat = () => {
  return (
    <div>
        <div style={{maxHeight: "400px", scrollBehavior: "smooth", minWidth:"unset"}}>
            <ul>
                <TextMessage sender="Anthony" message="Hello"></TextMessage>
                <TextMessage sender="David" message="Hello"></TextMessage>
                <TextMessage sender="Gary" message="Hello"></TextMessage>
            </ul>
        </div>
        <form>
            <input placeholder='Send message to Stranger' autoComplete='off'></input>
            <button>Send</button>
        </form>
    </div>
  )
}

export default TextChat
