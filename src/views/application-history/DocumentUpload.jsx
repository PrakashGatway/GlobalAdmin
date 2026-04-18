// DocumentUploadModal.jsx
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload } from '@coreui/icons'

const DocumentUploadModal = ({ visible, onClose, onUpload, uploading }) => {
  const [file, setFile] = useState(null)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('user')
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = () => {
    if (!file) {
      setError('Please select a file')
      return
    }
    if (!docName) {
      setError('Please enter document name')
      return
    }
    onUpload(file, docType, docName)
  }

  return (
    <CModal visible={visible} onClose={onClose} size="md">
      <CModalHeader>
        <CModalTitle>Upload Document</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}
        <CForm>
          <div className="mb-3">
            <CFormLabel>Document Name *</CFormLabel>
            <CFormInput
              type="text"
              placeholder="e.g., Passport Copy, IELTS Score, Transcript"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Document Type</CFormLabel>
            <CFormSelect value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="user">Student Document</option>
              <option value="ooshas">Ooshas Document</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Select File *</CFormLabel>
            <CFormInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
            />
            <small className="text-muted">Supported formats: PDF, JPG, PNG, DOC (Max 5MB)</small>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={uploading}>
          <CIcon icon={cilCloudUpload} className="me-2" />
          Upload
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default DocumentUploadModal



