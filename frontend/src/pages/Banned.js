import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banned = () => {
    const navigate = useNavigate()

    return (
        <div className='screen'>
                <div className="title">
                    <h1>Omegle Clone</h1>
                </div>
                <div className='title'>
                    <h3>You have been banned for several days!</h3>
                </div>
                <div>
                    <p>Due to multiple reports from other users recently, you have been banned for several days in accordance with the policy.</p>
                    <p>During this period, you cannot enjoy the chat with strangers in Omegle Clone.</p>
                </div>
                <button className='logInButton' style={{justifySelf: "center", margin: "0.5rem"}} onClick={() => {navigate("/login")}}>Back to Login Page</button>
        </div>
    )
}

export default Banned
