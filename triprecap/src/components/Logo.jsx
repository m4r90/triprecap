import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo.png'; // Add your logo image to assets folder

const Logo = ({ size = 'medium', linkToHome = true }) => {
  // Define sizes for the logo
  const sizes = {
    small: { width: '80px', height: 'auto' },
    medium: { width: '120px', height: 'auto' },
    large: { width: '180px', height: 'auto' }
  };
  
  // Logo container styles
  const containerStyle = {
    display: 'flex',
    alignItems: 'center'
  };
  
  // Logo text styles
  const logoTextStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    color: '#2A2D34',
    margin: 0,
    fontSize: size === 'small' ? '18px' : size === 'medium' ? '24px' : '32px',
    marginLeft: '10px'
  };
  
  // Logo element
  const logoElement = (
    <div style={containerStyle} className="logo">
      <img 
        src={logoImage} 
        alt="MemoMap Logo" 
        style={sizes[size]} 
      />
      <h1 style={logoTextStyle}>MemoMap</h1>
    </div>
  );
  
  // Return with or without link wrapper
  return linkToHome ? (
    <Link to="/" style={{ textDecoration: 'none' }}>
      {logoElement}
    </Link>
  ) : logoElement;
};

export default Logo; 