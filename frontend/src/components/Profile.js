import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProfile(data);
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:5000/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });

    const data = await response.json();
    alert(data.msg);
  };

  return (
    <div>
      <h1>Profile</h1>
      <input
        type="text"
        placeholder="Username"
        value={profile.username || ''}
        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
      />
      <button onClick={handleProfileUpdate}>Update Profile</button>
    </div>
  );
};

export default Profile;
