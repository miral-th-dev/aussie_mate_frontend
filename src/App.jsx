import './App.css'
import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import { ProtectedRoute, ScrollToTop, Loader, AppLayout } from './components'
import { authRoutes, customerRoutes, cleanerRoutes, publicRoutes, CLEANER_ROLES } from './routeGroups'
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<Loader fullscreen message="Setting up your Aussie Mate journey..." />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            {publicRoutes.map(({ path, component: Component, showHeader }, i) => (
              <Route key={i} path={path} element={
                showHeader ? (
                  <AppLayout showHeader={true}>
                    <Component />
                  </AppLayout>
                ) : (
                  <Component />
                )
              } />
            ))}

            {/* Customer protected */}
            {customerRoutes.map(({ path, component: Component, allowedRoles, showHeader }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={allowedRoles || ['Customer']} showHeader={showHeader !== false}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Cleaner protected */}
            {cleanerRoutes.map(({ path, component: Component, allowedRoles, showHeader }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={allowedRoles || CLEANER_ROLES} showHeader={showHeader !== false}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
