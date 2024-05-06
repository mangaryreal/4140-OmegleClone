import React from 'react'

const TextMessage = (props) => {
    const sender = props.sender
    const message = props.message

    return (
        <div style={{maxWidth: "250px"}}>
            <p style={{ wordWrap: 'break-word' }}><span style={{color:"blueviolet"}}>{sender}</span>: {message}</p>
        </div>
    )
}

export default TextMessage
