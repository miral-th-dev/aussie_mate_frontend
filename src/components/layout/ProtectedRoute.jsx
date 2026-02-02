import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AppLayout from './AppLayout'
                      import Loader from '../common/Loader'

const ProtectedRoute = ({ children, allowedRoles = [], showHeader = true }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return <Loader fullscreen message="Checking your access..." />
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0) {
    const userRole = user.role || user.userType
    const hasAccess = allowedRoles.includes(userRole)
    
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === 'Customer') {
        return <Navigate to="/customer-dashboard" replace />
      } else if (['Professional Cleaner', 'Student Cleaner', 'NDIS Assistant', 'Retail Auditor', 'Pet Sitter', 'Housekeeper'].includes(userRole)) {
        return <Navigate to="/cleaner-dashboard" replace />
      } else {
        return <Navigate to="/login" replace />
      }
    }
  }

  return <AppLayout showHeader={showHeader}>{children}</AppLayout>
}

export default ProtectedRoute
