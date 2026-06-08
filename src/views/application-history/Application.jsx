// ApplicationDetailModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormCheck,
  CBadge,
  CAlert,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CListGroup,
  CListGroupItem,
  CProgress,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilList,
  cilNotes,
  cilCheckCircle,
  cilWarning,
  cilClock,
  cilTrash,
  cilCloudUpload,
  cilReload,
  cilActionUndo,
  cilChevronBottom,
  cilHistory,
  cilPlus,
  cilSave,
  cilPencil,
  cilBan,
  cilViewModule,
  cilSend,
  cilPaperclip,
  cilChatBubble,
} from '@coreui/icons'
import applicationService from '../../services/applicationService'
import courseService from '../../services/courseService'
import DocumentUploadModal from './DocumentUpload'
import CKEditorComponent from '../page-information/Ckeditor'
import DocumentDetailModal from './DoucmentMoal'
import axiosInstance from '../../services/apiService'
import VisaProcessing from '../../components/VisaProcessing'

const ApplicationDetailModal = ({ visible, application, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [availableCourses, setAvailableCourses] = useState([])
  const [showDocUpload, setShowDocUpload] = useState(false)
  const [showRequirementForm, setShowRequirementForm] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showDocDetail, setShowDocDetail] = useState(false)
  const [newRequirement, setNewRequirement] = useState({
    type: 'user',
    name: '',
    description: '',
    required: 'optional',
    docUrl: '',
    docType: '',
    status: 'Pending',
    extra: [
      {
        label: '',
        type: 'text',
        required: false,
        validation: '',
      },
    ],
  })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index)
  }

  // Helper to handle status update and close dropdown
  const handleStatusSelect = (index, status, reason = null) => {
    if (status === 'Rejected') {
      const reason = prompt('Enter rejection reason:')
      if (reason) {
        handleUpdateDocumentStatus(index, status, reason)
      }
    } else {
      handleUpdateDocumentStatus(index, status)
    }
    setOpenDropdownIndex(null)
  }

  const handleAddField = () => {
    setNewRequirement((prev) => ({
      ...prev,
      extra: [...prev.extra, { label: '', type: 'text', required: false, validation: '' }],
    }))
  }

  const handleRemoveField = (index) => {
    const updated = [...newRequirement.extra]
    updated.splice(index, 1)
    setNewRequirement((prev) => ({ ...prev, extra: updated }))
  }

  const handleFieldChange = (index, key, value) => {
    const updated = [...newRequirement.extra]
    updated[index][key] = value
    setNewRequirement((prev) => ({ ...prev, extra: updated }))
  }

  const handleAddRequirement = () => {
    if (!newRequirement.name) {
      setError('Please enter document name')
      return
    }
    const newDoc = {
      ...newRequirement,
      status: 'Pending',
      extra: newRequirement.docType === 'form' ? JSON.stringify(newRequirement.extra) : [],
    }
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, newDoc],
    }))
    setNewRequirement({
      type: 'user',
      name: '',
      description: '',
      required: 'optional',
      docUrl: '',
      docType: '',
      status: 'Pending',
      extra: [{ label: '', type: 'text', required: false, validation: '' }],
    })
    setShowRequirementForm(false)
    setError('')
  }

  const handleFileUploadForRequirement = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image or PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await axiosInstance.post('/upload', formData)
      if (response.data?.success) {
        setNewRequirement((prev) => ({
          ...prev,
          docUrl: response.data.docUrl,
          docType: file.type,
        }))
        setSuccess('File uploaded successfully')
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleRemoveRequirement = (index) => {
    if (window.confirm('Are you sure you want to remove this document requirement?')) {
      setFormData((prev) => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index),
      }))
    }
  }

  // Form data for editing
  const [formData, setFormData] = useState({
    primaryStatus: '',
    paymentStatus: '',
    adminNotes: '',
    extraRequirements: {},
    rejectionReason: [],
    backups: [],
    documents: [],
  })

  // New rejection reason
  const [newRejection, setNewRejection] = useState({
    course: '',
    reason: '',
    status: 'Pending',
  })

  // New backup course
  const [newBackup, setNewBackup] = useState({
    course: '',
    intake: '',
    order: 0,
  })

  useEffect(() => {
    if (application) {
      setFormData({
        primaryStatus: application.primaryStatus || 'Pending',
        paymentStatus: application.paymentStatus || 'Pending',
        adminNotes: application.adminNotes || '',
        extraRequirements: application.extraRequirements || {},
        rejectionReason: application.rejectionReason || [],
        backups: application.backups || [],
        documents: application.documents || [],
      })
      fetchAvailableCourses()
    }
  }, [application])

  const fetchAvailableCourses = async () => {
    try {
      const response = await courseService.getCourses({ limit: 1000 })
      if (response.success) {
        setAvailableCourses(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleExtraRequirementsChange = (value) => {
    try {
      const parsed = JSON.parse(value)
      setFormData((prev) => ({ ...prev, extraRequirements: parsed }))
    } catch (err) {
      setFormData((prev) => ({ ...prev, extraRequirements: value }))
    }
  }

  // Handle rejection reason
  const handleAddRejection = () => {
    if (!newRejection.course || !newRejection.reason) {
      setError('Please select course and provide rejection reason')
      return
    }

    setFormData((prev) => ({
      ...prev,
      rejectionReason: [
        ...prev.rejectionReason,
        {
          ...newRejection,
          order: prev.rejectionReason.length + 1,
        },
      ],
    }))

    setNewRejection({ course: '', reason: '', status: 'Pending' })
    setError('')
  }

  const handleUpdateRejection = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.rejectionReason]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, rejectionReason: updated }
    })
  }

  const handleRemoveRejection = (index) => {
    setFormData((prev) => ({
      ...prev,
      rejectionReason: prev.rejectionReason.filter((_, i) => i !== index),
    }))
  }

  // Handle backup courses
  const handleAddBackup = () => {
    if (!newBackup.course || !newBackup.intake) {
      setError('Please select course and provide intake')
      return
    }

    setFormData((prev) => ({
      ...prev,
      backups: [
        ...prev.backups,
        {
          ...newBackup,
          order: prev.backups.length + 1,
        },
      ],
    }))

    setNewBackup({ course: '', intake: '', order: 0 })
    setError('')
  }

  const handleUpdateBackup = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.backups]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, backups: updated }
    })
  }

  const handleRemoveBackup = (index) => {
    setFormData((prev) => ({
      ...prev,
      backups: prev.backups.filter((_, i) => i !== index),
    }))
  }

  // Switch to backup course
  const handleSwitchToBackup = async (backupCourseId, backupIntake) => {
    if (!window.confirm('Are you sure you want to switch to this backup course?')) {
      return
    }

    setLoading(true)
    try {
      const response = await applicationService.updateApplication(application._id, {
        course: backupCourseId,
        intake: backupIntake,
        primaryStatus: 'Started',
      })

      if (response.success) {
        setSuccess('Successfully switched to backup course')
        setTimeout(() => {
          onUpdate()
          onClose()
        }, 1500)
      }
    } catch (err) {
      setError(err.message || 'Failed to switch course')
    } finally {
      setLoading(false)
    }
  }

  // Handle document status update
  const handleUpdateDocumentStatus = async (docIndex, status, rejectReason = '') => {
    setLoading(true)
    try {
      const updatedDocs = [...formData.documents]
      updatedDocs[docIndex] = {
        ...updatedDocs[docIndex],
        status,
        rejectReason: status === 'Rejected' ? rejectReason : '',
      }

      const response = await applicationService.updateApplication(application._id, {
        documents: updatedDocs,
      })

      if (response.success) {
        setFormData((prev) => ({ ...prev, documents: updatedDocs }))
        setSuccess('Document status updated')
      }
    } catch (err) {
      setError(err.message || 'Failed to update document status')
    } finally {
      setLoading(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (file, docType, docName) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('docType', docType)
      formData.append('name', docName)

      const response = await applicationService.uploadDocument(application._id, formData)

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, response.data],
        }))
        setSuccess('Document uploaded successfully')
        setShowDocUpload(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  // Save all changes
  const handleSaveChanges = async () => {
    setLoading(true)
    setError('')

    try {
      const updateData = {
        primaryStatus: formData.primaryStatus,
        paymentStatus: formData.paymentStatus,
        adminNotes: formData.adminNotes,
        rejectionReason: formData.rejectionReason,
        backups: formData.backups,
        documents: formData.documents,
      }

      const response = await applicationService.updateApplication(application._id, updateData)

      if (response.success) {
        setSuccess('Changes saved successfully')
        setEditing(false)
        setTimeout(() => {
          onUpdate()
        }, 1000)
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: 'warning',
      Started: 'info',
      ReviewbyOoshas: 'primary',
      SubmitToSchool: 'secondary',
      AwaitingSchoolResponse: 'dark',
      AdmissionProcessing: 'info',
      Refused: 'danger',
      VisaProcessing: 'info',
      Withdrawn: 'secondary',
      PreArrival: 'success',
      Arrived: 'success',
      Completed: 'success',
      inreview: 'info',
      Approved: 'success',
      Rejected: 'danger',
    }
    return colors[status] || 'light'
  }

  const getDocumentStatusBadge = (status) => {
    if (status === 'Approved')
      return (
        <CBadge color="success">
          <CIcon icon={cilCheckCircle} className="me-1" /> Approved
        </CBadge>
      )
    if (status === 'Rejected')
      return (
        <CBadge color="danger">
          <CIcon icon={cilBan} className="me-1" /> Rejected
        </CBadge>
      )
    if (status === 'inreview')
      return (
        <CBadge color="info">
          <CIcon icon={cilHistory} className="me-1" /> In Review
        </CBadge>
      )
    return (
      <CBadge color="warning">
        <CIcon icon={cilClock} className="me-1" /> Pending
      </CBadge>
    )
  }

  // ==============================
  // COMMENT SECTION STATES
  // ==============================
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [messageList, setMessageList] = useState([])
  const [messageText, setMessageText] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageAttachments, setMessageAttachments] = useState([])
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // ==============================
  // FILE UPLOAD
  // ==============================
  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return
    const filesArray = Array.from(e.target.files)
    setIsAttachmentUploading(true)

    try {
      for (const file of filesArray) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data?.success && response.data?.docUrl) {
          setMessageAttachments((prev) => [...prev, { name: file.name, url: response.data.docUrl }])
          setSuccess(`${file.name} uploaded successfully!`)
        } else {
          throw new Error(response.data?.message || 'Upload failed')
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
      setError(error?.message || 'Failed to upload file')
    } finally {
      setIsAttachmentUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ==============================
  // REMOVE FILE
  // ==============================
  const removeUploadedFile = (indexToRemove) => {
    setMessageAttachments((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  // ==============================
  // MARK AS READ
  // ==============================
  const markMessagesAsRead = async () => {
    try {
      await axiosInstance.put(`/communication/applications/${application?._id}/messages/read`)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // ==============================
  // FETCH MESSAGES
  // ==============================
  const fetchMessages = async () => {
    if (!application?._id) return
    try {
      const response = await axiosInstance.get(
        `/communication/applications/${application._id}/messages`,
      )
      setMessageList(response.data?.reverse() || [])
      console.log('api data', response.data?.reverse() || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    if (application?._id) {
      fetchMessages()
    }
  }, [application])

  // ==============================
  // SEND MESSAGE
  // ==============================
  const sendMessage = async () => {
    if (!messageText.trim()) return
    setIsCommentSubmitting(true)

    try {
      await axiosInstance.post(`/communication/applications/${application._id}/messages`, {
        content: messageText.trim(),
        userId: '',
        extra_content: {
          subject: messageSubject || 'General Update',
          camsId: application._id,
          recipient: 'Ooshas',
          attachments: messageAttachments,
        },
      })

      setMessageText('')
      setMessageSubject('')
      setMessageAttachments([])
      setIsCommentModalOpen(false)
      await fetchMessages()
      setSuccess('Comment saved successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setIsCommentSubmitting(false)
    }
  }


  const [Visainfo, setVisainfo] = useState([]);

  const fetchVisa = async () => {
    try {
      const response = await axiosInstance.get(`/visa/${application._id}`);

      console.log(response.data, "Data ");
      setVisainfo(response.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchVisa();
  }, [application]);

  if (!application) return null

  return (
    <>
      <CModal visible={visible} onClose={onClose} fullscreen scrollable>
        <CModalHeader>
          <CModalTitle>
            Application Details - {application.applicationNumber}
            <CBadge color={getStatusBadgeColor(application.primaryStatus)} className="ms-2">
              {application.primaryStatus}
            </CBadge>
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError('')}>
              {error}
            </CAlert>
          )}
          {success && (
            <CAlert color="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </CAlert>
          )}

          {/* Navigation Tabs */}
          <CNav variant="tabs" className="mb-3">
            <CNavItem>
              <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
                <CIcon icon={cilUser} className="me-2" />
                Student & Course Info
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
                <CIcon icon={cilList} className="me-2" />
                Documents ({formData.documents?.length || 0})
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                <CIcon icon={cilList} className="me-2" />
                Backups & Rejections
              </CNavLink>
            </CNavItem>
            {/* <CNavItem>
              <CNavLink active={activeTab === 3} onClick={() => setActiveTab(3)}>
                <CIcon icon={cilNotes} className="me-2" />
                Admin Actions
              </CNavLink>
            </CNavItem> */}
            <CNavItem>
              <CNavLink active={activeTab === 4} onClick={() => setActiveTab(4)}>
                <CIcon icon={cilChatBubble} className="me-2" />
                Comments ({messageList.filter(item => !item?.isRead).length})
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 5} onClick={() => setActiveTab(5)}>
                <CIcon icon={cilChatBubble} className="me-2" />
                Visa Processing 
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            {/* Tab 1: Student & Course Information */}
            <CTabPane visible={activeTab === 0}>
              <CRow className="g-4">
                <CCol md={6}>
                  <CCard>
                    <CCardHeader>
                      <h6 className="mb-0">Student Information</h6>
                    </CCardHeader>
                    <CCardBody>
                      <div className="mb-3">
                        <strong>Name:</strong> {application.student?.name || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Email:</strong> {application.student?.email || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Phone:</strong> {application.student?.phone || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Passport Number:</strong>{' '}
                        {application.student?.passportNumber || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Nationality:</strong> {application.student?.nationality || 'N/A'}
                      </div>

                      <div className='mb-3 ' style={{display : 'flex'}}>
                        <strong>Primary Status</strong>
                          
                      <CFormSelect
                        name="primaryStatus"
                        value={formData.primaryStatus}
                        onChange={handleInputChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Started">Started</option>
                        <option value="ReviewbyOoshas">Review by Ooshas</option>
                        <option value="SubmitToSchool">Submit to School</option>
                        <option value="AwaitingSchoolResponse">Awaiting School Response</option>
                        <option value="AdmissionProcessing">Admission Processing</option>
                        <option value="Refused">Refused</option>
                        <option value="VisaProcessing">Visa Prosessing</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="PreArrival">Pre-Arrival</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Completed">Completed</option>
                      </CFormSelect>

                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={6}>
                  <CCard>
                    <CCardHeader>
                      <h6 className="mb-0">Selected Course Information</h6>
                    </CCardHeader>
                    <CCardBody>
                      <div className="mb-3">
                        <strong>Country:</strong> {application.country || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>University:</strong> {application.course?.university?.name || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Course:</strong> {application.course?.name || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Intake:</strong> {application.intake || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Assigned to:</strong>{' '}
                        {application?.student?.assignee?.name || 'N/A'}
                      </div>
                      <div className="mb-3">
                        <strong>Payment Status:</strong>{' '}
                        <CBadge color={getStatusBadgeColor(application.paymentStatus)}>
                          {application.paymentStatus}
                        </CBadge>
                      </div>
                      <div className="mb-3">
                        <strong>Expectations:</strong>
                        <br />
                        <small>
                          Understood: {application.expectations?.understood ? 'Yes' : 'No'}
                        </small>
                        <br />
                        <small>Agreed: {application.expectations?.agreed ? 'Yes' : 'No'}</small>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CTabPane>

            {/* Tab 2: Document Management */}
            <CTabPane visible={activeTab === 1}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Document Management</h5>
                <CButton
                  color="success"
                  size="sm"
                  onClick={() => setShowRequirementForm(!showRequirementForm)}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Create Document Requirement
                </CButton>
              </div>

              {/* Document Requirement Form */}
              {showRequirementForm && (
                <CCard className="mb-4 border-primary">
                  <CCardHeader className="bg-primary text-white">
                    <h6 className="mb-0">Create Document Requirement</h6>
                  </CCardHeader>
                  <CCardBody>
                    <CRow className="g-3">
                      <CCol md={6}>
                        <CFormLabel>Document Type *</CFormLabel>
                        <CFormSelect
                          value={newRequirement.docType}
                          onChange={(e) =>
                            setNewRequirement((prev) => ({ ...prev, docType: e.target.value }))
                          }
                        >
                          <option value="document">Document (pdf, doc, docx)</option>
                          <option value="form">Question Form</option>
                          <option value="picture">Picture</option>
                          <option value="other">Other</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel>Response By *</CFormLabel>
                        <CFormSelect
                          value={newRequirement.type}
                          onChange={(e) =>
                            setNewRequirement((prev) => ({ ...prev, type: e.target.value }))
                          }
                        >
                          <option value="user">User Document (No upload required)</option>
                          <option value="ooshas">Ooshas Document (Upload required)</option>
                        </CFormSelect>
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel>Required Status *</CFormLabel>
                        <CFormSelect
                          value={newRequirement.required}
                          onChange={(e) =>
                            setNewRequirement((prev) => ({ ...prev, required: e.target.value }))
                          }
                        >
                          <option value="required">Required</option>
                          <option value="optional">Optional</option>
                        </CFormSelect>
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel>Document Name *</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="e.g., Passport Copy, IELTS Score, Transcript"
                          value={newRequirement.name}
                          onChange={(e) =>
                            setNewRequirement((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </CCol>

                      <CCol md={12}>
                        <CFormLabel>Description</CFormLabel>
                        <CKEditorComponent
                          value={newRequirement.description}
                          onChange={(e) =>
                            setNewRequirement((prev) => ({ ...prev, description: e }))
                          }
                          placeholder="Additional description or instructions for this document"
                        />
                      </CCol>

                      {newRequirement.type === 'ooshas' && newRequirement.docType !== 'form' && (
                        <CCol md={12}>
                          <CFormLabel>Upload Document *</CFormLabel>
                          <CFormInput
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUploadForRequirement}
                            disabled={uploadingFile}
                          />
                          {uploadingFile && <CSpinner size="sm" className="mt-2" />}
                          {newRequirement.docUrl && (
                            <div className="mt-2">
                              <CBadge color="success">
                                <CIcon icon={cilCheckCircle} className="me-1" />
                                File uploaded successfully
                              </CBadge>
                              <br />
                              <small className="text-muted">
                                <a
                                  href={newRequirement.docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View uploaded file
                                </a>
                              </small>
                            </div>
                          )}
                          <small className="text-muted">
                            Supported formats: PDF, JPG, PNG (Max 5MB)
                          </small>
                        </CCol>
                      )}

                      {newRequirement.docType === 'form' && (
                        <CCol md={12}>
                          <CFormLabel>Form Fields *</CFormLabel>
                          {newRequirement.extra.map((field, index) => (
                            <div key={index} className="border p-3 mb-3 rounded">
                              <CRow>
                                <CCol md={3}>
                                  <CFormLabel>Label</CFormLabel>
                                  <CFormInput
                                    value={field.label}
                                    onChange={(e) =>
                                      handleFieldChange(index, 'label', e.target.value)
                                    }
                                    placeholder="Enter field label"
                                  />
                                </CCol>
                                <CCol md={3}>
                                  <CFormLabel>Type</CFormLabel>
                                  <CFormSelect
                                    value={field.type}
                                    onChange={(e) =>
                                      handleFieldChange(index, 'type', e.target.value)
                                    }
                                  >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="password">Password</option>
                                  </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                  <CFormLabel>Required</CFormLabel>
                                  <CFormCheck
                                    checked={field.required}
                                    onChange={(e) =>
                                      handleFieldChange(index, 'required', e.target.checked)
                                    }
                                    label="Yes"
                                  />
                                </CCol>
                                <CCol md={3}>
                                  <CFormLabel>Validation</CFormLabel>
                                  <CFormInput
                                    value={field.validation}
                                    onChange={(e) =>
                                      handleFieldChange(index, 'validation', e.target.value)
                                    }
                                    placeholder="e.g. min:3, max:10"
                                  />
                                </CCol>
                                <CCol md={1} className="d-flex align-items-end">
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleRemoveField(index)}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CCol>
                              </CRow>
                            </div>
                          ))}
                          <CButton color="primary" size="sm" onClick={handleAddField}>
                            <CIcon icon={cilPlus} className="me-1" /> Add Field
                          </CButton>
                        </CCol>
                      )}

                      <CCol md={12}>
                        <div className="d-flex justify-content-end gap-2">
                          <CButton
                            color="secondary"
                            size="sm"
                            onClick={() => {
                              setShowRequirementForm(false)
                              setNewRequirement({
                                type: 'user',
                                name: '',
                                description: '',
                                required: 'optional',
                                docUrl: '',
                                docType: '',
                                status: 'Pending',
                                extra: [
                                  { label: '', type: 'text', required: false, validation: '' },
                                ],
                              })
                            }}
                          >
                            Cancel
                          </CButton>
                          <CButton color="primary" size="sm" onClick={handleAddRequirement}>
                            Add Requirement
                          </CButton>
                        </div>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              )}

              {/* Documents Table */}
              {formData.documents?.length === 0 ? (
                <CAlert color="info">
                  No documents added yet. Click "Create Document Requirement" to add required
                  documents.
                </CAlert>
              ) : (
                <CTable bordered responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ padding: '6px' }}>Document Name</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Type</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Required</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Description</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Reject Reason</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '6px' }}>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {formData.documents.map((doc, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell style={{ padding: '6px' }}>
                          <strong>{doc.name}</strong>
                          {doc.docUrl && (
                            <div>
                              <small>
                                <a
                                  href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${doc.docUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Document
                                </a>
                              </small>
                            </div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          <CBadge color={doc.type === 'ooshas' ? 'primary' : 'secondary'}>
                            {doc.type === 'ooshas' ? 'Ooshas Document' : 'User Document'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          <CBadge color={doc.required === 'required' ? 'danger' : 'info'}>
                            {doc.required === 'required' ? 'Required' : 'Optional'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          <div
                            className="line-clamp"
                            dangerouslySetInnerHTML={{ __html: doc.description }}
                            style={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          />
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          {getDocumentStatusBadge(doc.status)}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          {doc.rejectReason && (
                            <small className="text-danger">{doc.rejectReason}</small>
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: '6px' }}>
                          <div
                            className="position-relative"
                            ref={openDropdownIndex === index ? dropdownRef : null}
                          >
                            <div className="d-flex gap-1">
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoc(doc)
                                  setShowDocDetail(true)
                                }}
                              >
                                <CIcon icon={cilViewModule} />
                              </CButton>

                              <CDropdown>
                                <CDropdownToggle color="secondary" size="sm">
                                  Status <CIcon icon={cilChevronBottom} size="sm" />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem
                                    onClick={() => handleUpdateDocumentStatus(index, 'Pending')}
                                  >
                                    <CIcon icon={cilClock} className="me-2" /> Pending
                                  </CDropdownItem>
                                  <CDropdownItem
                                    onClick={() => handleUpdateDocumentStatus(index, 'inreview')}
                                  >
                                    <CIcon icon={cilHistory} className="me-2" /> In Review
                                  </CDropdownItem>
                                  <CDropdownItem
                                    onClick={() => handleUpdateDocumentStatus(index, 'Approved')}
                                  >
                                    <CIcon icon={cilCheckCircle} className="me-2" /> Approved
                                  </CDropdownItem>
                                  <CDropdownItem
                                    onClick={() => handleStatusSelect(index, 'Rejected')}
                                    className="text-danger"
                                  >
                                    <CIcon icon={cilBan} className="me-2" /> Rejected
                                  </CDropdownItem>
                                </CDropdownMenu>
                              </CDropdown>

                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveRequirement(index)}
                                title="Remove Document"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </div>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CTabPane>

            {/* Tab 3: Backup Courses & Rejection Reasons */}
            <CTabPane visible={activeTab === 2}>
              <CCard className="mb-4">
                <CCardHeader>
                  <h6 className="mb-0">Backup Courses</h6>
                </CCardHeader>
                <CCardBody>
                  <CRow className="g-3 mb-3">
                    <CCol md={5}>
                      <CFormSelect
                        value={newBackup.course}
                        onChange={(e) =>
                          setNewBackup((prev) => ({ ...prev, course: e.target.value }))
                        }
                      >
                        <option value="">Select Backup Course</option>
                        {availableCourses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name} - {course.university?.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        placeholder="Intake (e.g., September 2025)"
                        value={newBackup.intake}
                        onChange={(e) =>
                          setNewBackup((prev) => ({ ...prev, intake: e.target.value }))
                        }
                      />
                    </CCol>
                    <CCol md={3}>
                      <CButton color="primary" onClick={handleAddBackup}>
                        <CIcon icon={cilPlus} className="me-1" /> Add Backup
                      </CButton>
                    </CCol>
                  </CRow>

                  {formData.backups?.length === 0 ? (
                    <CAlert color="info">No backup courses added.</CAlert>
                  ) : (
                    formData.backups.map((backup, index) => (
                      <CCard key={index} className="mb-2">
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>
                                {availableCourses.find((c) => c._id === backup.course)?.name ||
                                  backup.course}
                              </strong>
                              <br />
                              <small>Intake: {backup.intake}</small>
                              <br />
                              <small>Order: {backup.order}</small>
                            </div>
                            <CButtonGroup>
                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => handleSwitchToBackup(backup.course, backup.intake)}
                                title="Switch to this course"
                              >
                                <CIcon icon={cilActionUndo} className="me-1" /> Switch
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveBackup(index)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CButtonGroup>
                          </div>
                        </CCardBody>
                      </CCard>
                    ))
                  )}
                </CCardBody>
              </CCard>

              <CCard>
                <CCardHeader>
                  <h6 className="mb-0">Course Rejection Reasons</h6>
                </CCardHeader>
                <CCardBody>
                  <CRow className="g-3 mb-3">
                    <CCol md={5}>
                      <CFormSelect
                        value={newRejection.course}
                        onChange={(e) =>
                          setNewRejection((prev) => ({ ...prev, course: e.target.value }))
                        }
                      >
                        <option value="">Select Course</option>
                        <option value={application.course?._id}>
                          Main: {application.course?.name}
                        </option>
                        {formData.backups?.map((backup, idx) => (
                          <option key={idx} value={backup.course}>
                            Backup: {availableCourses.find((c) => c._id === backup.course)?.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={5}>
                      <CFormInput
                        type="text"
                        placeholder="Rejection reason"
                        value={newRejection.reason}
                        onChange={(e) =>
                          setNewRejection((prev) => ({ ...prev, reason: e.target.value }))
                        }
                      />
                    </CCol>
                    <CCol md={2}>
                      <CButton color="warning" onClick={handleAddRejection}>
                        <CIcon icon={cilPlus} className="me-1" /> Add Reason
                      </CButton>
                    </CCol>
                  </CRow>

                  {formData.rejectionReason?.length === 0 ? (
                    <CAlert color="info">No rejection reasons recorded.</CAlert>
                  ) : (
                    <CTable responsive hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Course</CTableHeaderCell>
                          <CTableHeaderCell>Reason</CTableHeaderCell>
                          <CTableHeaderCell>Status</CTableHeaderCell>
                          <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {formData.rejectionReason.map((reason, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>
                              {reason.course === application.course?._id
                                ? `Main: ${application.course?.name}`
                                : `Backup: ${availableCourses.find((c) => c._id === reason.course)?.name || reason.course}`}
                            </CTableDataCell>
                            <CTableDataCell>{reason.reason}</CTableDataCell>
                            <CTableDataCell>
                              <CFormSelect
                                size="sm"
                                value={reason.status}
                                onChange={(e) =>
                                  handleUpdateRejection(index, 'status', e.target.value)
                                }
                                style={{ width: '130px' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="inreview">In Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                              </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveRejection(index)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </CCardBody>
              </CCard>
            </CTabPane>

            {/* Tab 4: Admin Actions */}
            <CTabPane visible={activeTab === 3}>
              <CCard>
                <CCardHeader>
                  <h6 className="mb-0">Application Status Management</h6>
                </CCardHeader>
                <CCardBody>
                  <CRow className="g-3">
                    <CCol md={6}>
                      <CFormLabel>Primary Status</CFormLabel>
                      <CFormSelect
                        name="primaryStatus"
                        value={formData.primaryStatus}
                        onChange={handleInputChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Started">Started</option>
                        <option value="ReviewbyOoshas">Review by Ooshas</option>
                        <option value="SubmitToSchool">Submit to School</option>
                        <option value="AwaitingSchoolResponse">Awaiting School Response</option>
                        <option value="AdmissionProcessing">Admission Processing</option>
                        <option value="Refused">Refused</option>
                        <option value="VisaProcessing">Visa Prosessing</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="PreArrival">Pre-Arrival</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Completed">Completed</option>
                      </CFormSelect>
                    </CCol>

                    <CCol md={12}>
                      <CFormLabel>Admin Notes</CFormLabel>
                      <CFormTextarea
                        name="adminNotes"
                        rows="4"
                        value={formData.adminNotes}
                        onChange={handleInputChange}
                        placeholder="Add internal notes about this application..."
                      />
                    </CCol>

                    <CCol md={12}>
                      <CFormLabel>Extra Requirements (JSON Format)</CFormLabel>
                      <CFormTextarea
                        rows="6"
                        value={
                          typeof formData.extraRequirements === 'object'
                            ? JSON.stringify(formData.extraRequirements, null, 2)
                            : formData.extraRequirements
                        }
                        onChange={(e) => handleExtraRequirementsChange(e.target.value)}
                        placeholder={`{
  "additionalDocs": ["Statement of Purpose", "Recommendation Letter"],
  "deadline": "2025-12-31",
  "notes": "Any special requirements"
}`}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CTabPane>

            {/* Tab 5: Comments */}
            <CTabPane visible={activeTab === 4}>
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Ticket Communication History</h6>
                  <CButton color="primary" size="sm" onClick={() => setIsCommentModalOpen(true)}>
                    <CIcon icon={cilChatBubble} className="me-1" /> Add Comment
                  </CButton>
                </CCardHeader>
                <CCardBody>
                  {messageList.length === 0 ? (
                    <CAlert color="info">
                      No comments yet. Add a comment to start the conversation.
                    </CAlert>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div
                        className="d-none d-md-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 3fr 2fr 1fr',
                          gap: '1rem',
                        }}
                      >
                        <div className="fw-bold text-muted">Details</div>
                        <div className="fw-bold text-muted">Comment</div>
                        <div className="fw-bold text-muted">Status</div>
                        <div className="fw-bold text-muted">Commented By</div>
                      </div>
                      <hr className="my-2" />

                      {/* Messages List */}
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {messageList.map((item, index) => (
                          <div key={item._id || index} className="mb-4 pb-3 border-bottom">
                            <CRow>
                              <CCol md={3}>
                                <div className="text-sm text-muted">
                                  <div>
                                    <strong>Date:</strong> {item.createdAt?.split('T')[0]}
                                  </div>
                                  <div className="mt-2">
                                    <strong>Subject:</strong>
                                    <div className="mt-1">
                                      {item.extra_content?.subject || 'General Update'}
                                    </div>
                                  </div>
                                </div>
                              </CCol>
                              <CCol md={4}>
                                <div className="text-muted">{item.content}</div>
                                {item.extra_content?.attachments?.[0]?.name && (
                                  <div className="mt-2">
                                    <a
                                      href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.extra_content.attachments[0].url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
                                      <CIcon icon={cilPaperclip} className="me-1" />
                                      {item.extra_content.attachments[0].name}
                                    </a>
                                  </div>
                                )}
                              </CCol>
                              <CCol md={3}>
                                <div>
                                  <strong>Primary Status:</strong>
                                </div>
                                <div>{item.primaryStatus || 'Application Processed'}</div>
                                <div className="mt-2">
                                  <strong>Message Status:</strong>
                                </div>
                                <CBadge color={item?.isRead ? 'success' : 'warning'}>
                                  {item?.isRead ? 'Read' : 'Unread'}
                                </CBadge>
                              </CCol>
                              <CCol md={2}>
                                <div className="d-flex flex-column align-items-start gap-2">
                                  <CBadge color="secondary">
                                    {item.userType === 'student' ? 'Student' : item.userType}
                                  </CBadge>
                                  {item.userType !== 'ooshas' && !item?.isRead && (
                                    <CButton
                                      color="primary"
                                      size="sm"
                                      onClick={() => {
                                        setIsCommentModalOpen(true)
                                        setMessageSubject(item?.extra_content?.subject)
                                        markMessagesAsRead()
                                      }}
                                    >
                                      <CIcon icon={cilSend} className="me-1" /> Reply
                                    </CButton>
                                  )}
                                </div>
                              </CCol>
                            </CRow>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CTabPane>
            
            <CTabPane visible={activeTab === 5}>
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Visa Prosessing</h6>
                       
                </CCardHeader>
                <CCardBody>
                    <VisaProcessing data={Visainfo} application={application} /> 
                </CCardBody>
              </CCard>
            </CTabPane>

          </CTabContent>
        </CModalBody>

        <CModalFooter>
          <div className="d-flex justify-content-between w-100">
            <div>
              <CButton color="secondary" onClick={onClose}>
                Close
              </CButton>
            </div>
            <div className="d-flex gap-2 "  style={{marginRight: '1rem'}}>
              <CButton color="primary"  onClick={handleSaveChanges} disabled={loading} >
                {loading ? (
                  <CSpinner size="sm" />
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-2" /> Save Changes
                  </>
                )}
              </CButton>
              {activeTab < 5 && (
                <CButton color="primary" onClick={() => setActiveTab(activeTab + 1)} >
                  Next
                </CButton>
              )}
            </div>
          </div>
        </CModalFooter>
      </CModal>

      {/* Comment Modal */}
      <CModal visible={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)} size="lg">
        <CModalHeader>
          <CModalTitle>New Message</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel>To</CFormLabel>
              <CFormInput value="Ooshas" disabled />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Subject</CFormLabel>
              <CFormSelect
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              >
                <option value="">Select a subject...</option>
                <option value="Application Processed">Application Processed</option>
                <option value="Document Uploaded">Document Uploaded</option>
                <option value="University Update">University Update</option>
                <option value="General Update">General Update</option>
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormLabel>Message</CFormLabel>
              <CFormTextarea
                rows="5"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your comment details here..."
              />
            </CCol>
            {messageAttachments.length > 0 && (
              <CCol md={12}>
                <CFormLabel>Attachments</CFormLabel>
                <div className="d-flex flex-wrap gap-2">
                  {messageAttachments.map((file, index) => (
                    <div key={index} className="border rounded p-2 d-flex align-items-center gap-2">
                      <CIcon icon={cilPaperclip} />
                      <span>{file.name}</span>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUploadedFile(index)}
                      >
                        ×
                      </CButton>
                    </div>
                  ))}
                </div>
              </CCol>
            )}
          </CRow>
        </CModalBody>
        <CModalFooter>
          <div className="d-flex justify-content-between w-100">
            <div>
              <CButton
                color="secondary"
                size="sm"
                disabled={
                  messageSubject !== 'Document Uploaded' ||
                  isAttachmentUploading ||
                  isCommentSubmitting
                }
                onClick={() => fileInputRef.current?.click()}
              >
                <CIcon icon={cilPaperclip} className="me-1" /> Upload
              </CButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                disabled={isAttachmentUploading || isCommentSubmitting}
                className="d-none"
              />
            </div>
            <div className="d-flex gap-2">
              <CButton color="secondary" onClick={() => setIsCommentModalOpen(false)}>
                Cancel
              </CButton>
              <CButton
                color="primary"
                onClick={sendMessage}
                disabled={isCommentSubmitting || isAttachmentUploading || !messageText.trim()}
              >
                {isCommentSubmitting ? (
                  <CSpinner size="sm" className="me-1" />
                ) : (
                  <CIcon icon={cilSend} className="me-1" />
                )}
                Send
              </CButton>
            </div>
          </div>
        </CModalFooter>
      </CModal>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        visible={showDocDetail}
        doc={selectedDoc}
        onClose={() => setShowDocDetail(false)}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        visible={showDocUpload}
        onClose={() => setShowDocUpload(false)}
        onUpload={handleDocumentUpload}
        uploading={loading}
      />
    </>
  )
}

export default ApplicationDetailModal
