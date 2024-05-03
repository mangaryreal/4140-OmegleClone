import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleChange = (event) => {
    const { value } = event.target;
    setUsername(value);

    // Regular expression pattern to match only English alphabets, numbers, and underscore
    const pattern = /^[A-Za-z0-9_]+$/;
    const isValidInput = pattern.test(value);
    setIsValid(isValidInput);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    alert('Username is valid: ' + username);

    const requestBody = {
      username: username,
    };

    const newUserID = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(requestBody),
    });
  
    if (newUserID.ok){
      const resourse = await newUserID.json();
      //const uid = resourse.userID;
      //alert("UserID: " + uid);
      alert(resourse.message);
      navigate("/login");
    } else {
      const data = await newUserID.json();
      if (data.message === "Duplicated username") {
        alert("Duplicated username. Please try again.");
      } else {
        alert("Failed to register. Please try again.");
      }
    }
  
  };

  return (
    <div className='screen'>
        <div className='title'>
            <h1>Omegle Clone</h1>
        </div>
        <div className='title'>
            <h3>Register Page</h3>
            <p>Start wonderful chat in Omegle Clone!</p>
        </div>
        <form onSubmit={handleSubmit} style={{padding: "50px 0"}}>
            <div>
                <label>Set-up your username (This is immutable)</label>
                <p>Only accept alphabets, numbers and underscores</p>
            </div>
            <div>
                <input
                    name='username'
                    placeholder='e.g.: omegleIsGud'
                    value={username}
                    onChange={handleChange}
                />
                {!isValid && <p>Please enter a valid username.</p>}
                {isValid && <p>Valid username</p>}
            </div>
            <button type='submit' disabled={!isValid} className='registerButton'>Register</button>
        </form>
    </div>
  );
};

export default Register;