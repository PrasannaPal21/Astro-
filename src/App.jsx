import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BirthChartForm from './pages/BirthChartForm';

// Navigation component using only standard HTML and react-router-dom's Link
const Navigation = () => (
  <nav className="app-header">
    <div className="toolbar">
      <div className="nav-links">
        <Link to="/login" className="nav-button primary">
          Login
        </Link>
        <Link to="/signup" className="nav-button secondary">
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="stars"></div>
        <div className="stars-layer"></div>
        <div className="cosmic-dust"></div>
        <div className="mystical-orb-1"></div>
        <div className="mystical-orb-2"></div>
        <div className="mystical-orb-3"></div>
        <div className="energy-wave-1"></div>
        <div className="energy-wave-2"></div>
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/birth-chart" element={<BirthChartForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
