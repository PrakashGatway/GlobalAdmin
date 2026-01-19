import React from 'react'
import { CAlert, CButton, CContainer } from '@coreui/react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <CContainer className="min-vh-100 d-flex align-items-center justify-content-center">
          <CAlert color="danger">
            <h4>Something went wrong</h4>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <CButton
              color="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Reload Page
            </CButton>
          </CAlert>
        </CContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
