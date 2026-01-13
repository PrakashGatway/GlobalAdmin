import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

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
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
