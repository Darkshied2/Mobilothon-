import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Challenge from './components/Challenge';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/challenge" element={<Challenge />} />
      </Routes>
    </Router>
  );
}

export default App;
