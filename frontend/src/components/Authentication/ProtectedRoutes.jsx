import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Checks if the user is logged in. If not, redirects to login page.
 * @returns {JSX.Element}
 */
const ProtectedRoutes = () => {
  const { isLoggedIn } = useAuth();
  return (
    isLoggedIn ? <Outlet/> : <Navigate to='/login' />
  )
}

export default ProtectedRoutes