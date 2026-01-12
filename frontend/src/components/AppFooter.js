import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span>&copy; 2025 C-way global. All rights reserved.</span>
      </div>
      <div className="ms-auto">
        <span>Admin Dashboard</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
