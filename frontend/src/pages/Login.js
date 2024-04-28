import React, { useState } from 'react'
import { users } from '../demo-data/data' 
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [userID, setUserID] = useState("")
    const navigate = useNavigate()

    const handleLogin = (e) => {
        // please do it here
        const foundUser = users.find((user) => user.userID === parseInt(userID));
        
        if (foundUser) {
            navigate("/")
        } else {
            alert("User not found");
        }
    }


    return (
        <div className='screen'>
            <div className="title">
                <h1>Omegle Clone</h1>
            </div>
            <div className='title'>
                <h3>Login Page</h3>
            </div>
            <form onSubmit={handleLogin} style={{display: "grid", justifyContent: "center"}}>
                <div style={{justifySelf: "center"}}>
                    <label>User ID</label>
                    <br></br>
                    <p></p>
                </div>
                <div style={{justifySelf: "center"}}>
                    <input name='userID' placeholder='12-16 characters long' value={userID} onChange={(e) => {setUserID(e.target.value)}}></input>
                    <br></br>
                    <p></p>
                </div>
                <button type='submit' className='logInButton' style={{justifySelf: "center"}}>Log in</button>
            </form>
        </div>
    )
}

export default Login
