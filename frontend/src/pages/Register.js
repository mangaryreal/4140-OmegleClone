import React, { useState } from 'react';

const Register = () => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Username is valid: ' + username);

    // set up an API POST request and get the User ID from the reponse
    // Then, you could either hide the current page and set up a page to show the UserID
    // or show a alert message 
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