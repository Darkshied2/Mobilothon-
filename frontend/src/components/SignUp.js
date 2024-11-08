import React, { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await axios.post('http://localhost:5000/signup', {
        username,
        password,
      });
      alert('Registration successful!');
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        alert('Registration failed: ' + error.response.data.msg);
      } else if (error.request) {
        // Request was made but no response received
        alert('Registration failed: No response received from server.');
      } else {
        // Something happened in setting up the request
        alert('Registration failed: ' + error.message);
      }
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}

export default SignUp;
