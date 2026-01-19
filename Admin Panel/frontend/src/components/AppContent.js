import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner, CAlert } from '@coreui/react'

// routes config
import routes from '../routes'

const NotFound = () => {
  return (
    <CAlert color="danger">
      <h4>Route not found</h4>
      <p>The page you are looking for does not exist.</p>
    </CAlert>
  )
}

const AppContent = () => {
  return (
    <CContainer className="px-4 animate-fade-in" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            // Skip routes without element or exact routes that are just placeholders
            if (!route.element || (route.exact && route.path === '/')) {
              return null
            }
            return (
              <Route
                key={idx}
                path={route.path}
                name={route.name}
                element={<route.element />}
              />
            )
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
