import React, { useState, useEffect } from 'react'
//import { users } from '../demo-data/data' 
import { useNavigate } from 'react-router-dom';

/*function createCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}*/

function Login() {
//const Login = () => {
    const [userID, setUserID] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const cookieList = document.cookie.split(';');
        let jwtToken = '';
        cookieList.forEach(async (cookie) => {
            //alert("checking cookie list") can check here
            if (cookie.startsWith('Omeglejwtsign=')) {
            try {
              jwtToken = cookie.substr(14);
              const res = await fetch('http://localhost:3001/protected', {
                  method: 'POST',
                  headers: {
                  'Content-type': 'application/json',
                  },
                  body: JSON.stringify({ jwtToken: jwtToken }),
              });
              
              if (res.ok) {
                  //const result = await res.json();
                  navigate("/")
              } 
            } catch (e) {
            console.error('Error');
            }
        }});
    }, []); // Run this effect only once on component mount

    const handleLogin = async (e) => {
        e.preventDefault()

        const requestBody = {
            userID: userID,
          };
    
        const auth = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });
        console.log("Login Response:", auth);
    
        if (auth.ok) {
            const res = await auth.json();
            alert(res.message);
            console.log("Login Success Response:", res);
            document.cookie = `Omeglejwtsign=${res.token}; path:/`;
            alert("Going to main page....")
            navigate("/");
            return;
        }   else {
            const data = await auth.json();
                alert(data.message);
        }


        /*const userID = parseInt(e.target.userID.value);
      
        const foundUser = users.find((user) => user.userID === userID);
      
        if (foundUser) {
          const username = foundUser.username;

          createCookie("OmegleClone", username, 0.25)
          createCookie("OmegleCloneID", userID, 0.25)
      
          navigate("/");
        } else {
          alert("User not found");
        }*/
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
                    <label>USER ID</label>
                    <br></br>
                    <p></p>
                </div>
                <div style={{justifySelf: "center"}}>
                    <input  name='userID' 
                            placeholder='12-16 characters long' 
                            value={userID} 
                            onChange={(e) => {setUserID(e.target.value)}}></input>
                    <br></br>
                    <p></p>
                </div>
                <button type='submit' className='logInButton' style={{justifySelf: "center"}}>Log in</button>
            </form>
            <button className='logInButton' style={{justifySelf: "center", margin: "0.5rem"}} onClick={() => {navigate("/register")}}>Register</button>
        </div>
    )
}

export default Login
