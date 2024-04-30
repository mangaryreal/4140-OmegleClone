import React from 'react'

const TextMessage = (props) => {
    const sender = props.sender
    const message = props.message

    return (
        <div>
            <li>{sender}</li>
            <li>{message}</li>
        </div>
    )
}

export default TextMessage
