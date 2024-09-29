import React, { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import axiosAuth from '../api/axiosAuth';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkLogin = async (): Promise<any> => {
    await axiosAuth.get(`${import.meta.env.VITE_FMP_API_URL}/check_session`)
      .then(() => {
        setIsLoggedIn(true)
      })
      .catch(() => {
        setIsLoggedIn(false)
      })
  }


  // Check if the user is logged in
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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


export default AuthContext;