import React from 'react';

/**
 * Display a 404 page.
 * @returns 
 */
const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 - Not Found</h1>
      <p style={styles.text}>Sorry, the page you are looking for might be in another castle.</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: '3rem',
    color: '#333',
  },
  text: {
    fontSize: '1.5rem',
    color: '#666',
  },
};

export default NotFound;
