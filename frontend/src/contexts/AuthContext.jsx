import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosAuth from '../api/axiosAuth';
import '../assets/style/index.css'

const AuthContext = createContext({});


/**
 * @function AuthProvider
 * @description Provider for authentication state
 * @param {*} children - React components
 * @returns  {JSX.Element} - Provider for authentication state
 */
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null)

  /**
   * @function checkLogin
   * @description Check if the user is logged in
   * @returns {Promise} 
  */
  const checkLogin = async () => {
    const res = await axiosAuth.get(`${import.meta.env.VITE_FMP_API_URL}/check_session`)
      .then((res) => {
        setIsLoggedIn(true)
      })
      .catch((err) => {
        setIsLoggedIn(false)
      })
  }

  /**
   * @function useEffect
   * @description Check if the user is logged in
  */
  useEffect(() => {
    checkLogin()
  }, [])


  if (isLoggedIn === null) {
    // Loading state, render a loading spinner or placeholder
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={{
      isLoggedIn, setIsLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * @function useAuth
 * @description Hook for authentication state
 * @returns {Object} - Authentication state
 */
export const useAuth = () => useContext(AuthContext);

/**
 * @exports default
 * @description Context for authentication state
 */
export default AuthContext;