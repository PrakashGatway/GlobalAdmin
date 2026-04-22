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
    cilViewModule
} from '@coreui/icons'
import applicationService from '../../services/applicationService'
import courseService from '../../services/courseService'
import DocumentUploadModal from './DocumentUpload'
import CKEditorComponent from '../page-information/Ckeditor'
import DocumentDetailModal from './DoucmentMoal'

const ApplicationDetailModal = ({ visible, application, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editing, setEditing] = useState(false)
    const [availableCourses, setAvailableCourses] = useState([])
    const [showDocUpload, setShowDocUpload] = useState(false)
    const [showRequirementForm, setShowRequirementForm] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showDocDetail, setShowDocDetail] = useState(false);
    const [newRequirement, setNewRequirement] = useState({
        type: 'user',
        name: '',
        description: '',
        required: 'optional',
        docUrl: '',
        docType: '',
        status: 'Pending',
        extra: [{
            label: "",
            type: "text",
            required: false,
            validation: ""
        }]
    })
    const [uploadingFile, setUploadingFile] = useState(false)
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (index) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    // Helper to handle status update and close dropdown
    const handleStatusSelect = (index, status, reason = null) => {
        if (status === 'Rejected') {
            const reason = prompt('Enter rejection reason:');
            if (reason) {
                handleUpdateDocumentStatus(index, status, reason);
            }
        } else {
            handleUpdateDocumentStatus(index, status);
        }
        setOpenDropdownIndex(null); // Close dropdown after selection
    };
    // const [formFields, setFormFields] = useState([
    //     {
    //         label: "",
    //         type: "text",
    //         required: false,
    //         validation: ""
    //     }
    // ]);

    const handleAddField = () => {
        setNewRequirement(prev => ({
            ...prev,
            extra: [...prev.extra, { label: "", type: "text", required: false, validation: "" }]
        }))
    };

    const handleRemoveField = (index) => {
        const updated = [...newRequirement.extra];
        updated.splice(index, 1);
        setNewRequirement(prev => ({ ...prev, extra: updated }));
    };

    const handleFieldChange = (index, key, value) => {
        const updated = [...newRequirement.extra];
        updated[index][key] = value;
        setNewRequirement(prev => ({ ...prev, extra: updated }));

    };

    const handleAddRequirement = () => {
        if (!newRequirement.name) {
            setError('Please enter document name')
            return
        }
        const newDoc = {
            ...newRequirement,
            status: 'Pending',
            extra:
                newRequirement.docType === 'form'
                    ? JSON.stringify(newRequirement.extra) // 🔥 convert to string
                    : []
        }
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, newDoc]
        }))
        setNewRequirement({
            type: 'user',
            name: '',
            description: '',
            required: 'optional',
            docUrl: '',
            docType: '',
            status: 'Pending',
            extra: [{ label: "", type: "text", required: false, validation: "" }]
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
            // Use your existing upload service
            const uploadResponse = await uploadService.uploadDocument(file)
            if (uploadResponse.success) {
                setNewRequirement(prev => ({
                    ...prev,
                    docUrl: uploadResponse.data.url,
                    docType: file.type
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
            setFormData(prev => ({
                ...prev,
                documents: prev.documents.filter((_, i) => i !== index)
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
        documents: []
    })

    // New rejection reason
    const [newRejection, setNewRejection] = useState({
        course: '',
        reason: '',
        status: 'Pending'
    })

    // New backup course
    const [newBackup, setNewBackup] = useState({
        course: '',
        intake: '',
        order: 0
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
                documents: application.documents || []
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
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleExtraRequirementsChange = (value) => {
        try {
            const parsed = JSON.parse(value)
            setFormData(prev => ({ ...prev, extraRequirements: parsed }))
        } catch (err) {
            // Invalid JSON, store as string
            setFormData(prev => ({ ...prev, extraRequirements: value }))
        }
    }

    // Handle rejection reason
    const handleAddRejection = () => {
        if (!newRejection.course || !newRejection.reason) {
            setError('Please select course and provide rejection reason')
            return
        }

        setFormData(prev => ({
            ...prev,
            rejectionReason: [
                ...prev.rejectionReason,
                {
                    ...newRejection,
                    order: prev.rejectionReason.length + 1
                }
            ]
        }))

        setNewRejection({ course: '', reason: '', status: 'Pending' })
        setError('')
    }

    const handleUpdateRejection = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.rejectionReason]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, rejectionReason: updated }
        })
    }

    const handleRemoveRejection = (index) => {
        setFormData(prev => ({
            ...prev,
            rejectionReason: prev.rejectionReason.filter((_, i) => i !== index)
        }))
    }

    // Handle backup courses
    const handleAddBackup = () => {
        if (!newBackup.course || !newBackup.intake) {
            setError('Please select course and provide intake')
            return
        }

        setFormData(prev => ({
            ...prev,
            backups: [
                ...prev.backups,
                {
                    ...newBackup,
                    order: prev.backups.length + 1
                }
            ]
        }))

        setNewBackup({ course: '', intake: '', order: 0 })
        setError('')
    }

    const handleUpdateBackup = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.backups]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, backups: updated }
        })
    }

    const handleRemoveBackup = (index) => {
        setFormData(prev => ({
            ...prev,
            backups: prev.backups.filter((_, i) => i !== index)
        }))
    }

    // Switch to backup course (set as main course)
    const handleSwitchToBackup = async (backupCourseId, backupIntake) => {
        if (!window.confirm('Are you sure you want to switch to this backup course? This will update the main course selection.')) {
            return
        }

        setLoading(true)
        try {
            const response = await applicationService.updateApplication(application._id, {
                course: backupCourseId,
                intake: backupIntake,
                primaryStatus: 'Started'
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
                rejectReason: status === 'Rejected' ? rejectReason : ''
            }

            const response = await applicationService.updateApplication(application._id, {
                documents: updatedDocs
            })

            if (response.success) {
                setFormData(prev => ({ ...prev, documents: updatedDocs }))
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
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents, response.data]
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
                // extraRequirements: formData.extraRequirements,
                rejectionReason: formData.rejectionReason,
                backups: formData.backups,
                documents: formData.documents
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
            'Pending': 'warning',
            'Started': 'info',
            'ReviewbyOoshas': 'primary',
            'SubmitToSchool': 'secondary',
            'AwaitingSchoolResponse': 'dark',
            'AdmissionProcessing': 'info',
            'Refused': 'danger',
            'Withdrawn': 'secondary',
            'PreArrival': 'success',
            'Arrived': 'success',
            'Completed': 'success',
            'inreview': 'info',
            'Approved': 'success',
            'Rejected': 'danger'
        }
        return colors[status] || 'light'
    }

    const getDocumentStatusBadge = (status) => {
        if (status === 'Approved') return <CBadge color="success"><CIcon icon={cilCheckCircle} /> Approved</CBadge>
        if (status === 'Rejected') return <CBadge color="danger"><CIcon icon={cilBan} /> Rejected</CBadge>
        if (status === 'inreview') return <CBadge color="info"><CIcon icon={cilHistory} /> In Review</CBadge>
        return <CBadge color="warning"><CIcon icon={cilClock} /> Pending</CBadge>
    }

    if (!application) return null

    return (
        <>
            <CModal
                visible={visible}
                onClose={onClose}
                fullscreen
                scrollable

            >
                <CModalHeader className='container'>
                    <CModalTitle>
                        Application Details - {application.applicationNumber}
                        <CBadge color="primary" className="ms-2">
                            {application.primaryStatus}
                        </CBadge>
                    </CModalTitle>
                </CModalHeader>

                <CModalBody className='container'>
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
                                {/* <CIcon icon={cilDocument} className="me-2" /> */}
                                Documents ({formData.documents?.length || 0})
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                                <CIcon icon={cilList} className="me-2" />
                                Backups & Rejections
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink active={activeTab === 3} onClick={() => setActiveTab(3)}>
                                <CIcon icon={cilNotes} className="me-2" />
                                Admin Actions
                            </CNavLink>
                        </CNavItem>
                    </CNav>

                    <CTabContent>
                        {/* Tab 1: Student & Course Information */}
                        <CTabPane visible={activeTab === 0}>
                            <CRow className="g-4">
                                {/* Student Information */}
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
                                                <strong>Passport Number:</strong> {application.student?.passportNumber || 'N/A'}
                                            </div>
                                            <div className="mb-3">
                                                <strong>Nationality:</strong> {application.student?.nationality || 'N/A'}
                                            </div>
                                        </CCardBody>
                                    </CCard>
                                </CCol>

                                {/* Course Information */}
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
                                                <strong>Payment Status:</strong>{' '}
                                                <CBadge color={getStatusBadgeColor(application.paymentStatus)}>
                                                    {application.paymentStatus}
                                                </CBadge>
                                            </div>
                                            <div className="mb-3">
                                                <strong>Expectations:</strong><br />
                                                <small>Understood: {application.expectations?.understood ? 'Yes' : 'No'}</small><br />
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
                                <div className="d-flex gap-2">
                                    <CButton
                                        color="success"
                                        size="sm"
                                        onClick={() => setShowRequirementForm(!showRequirementForm)}
                                    >
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Create Document Requirement
                                    </CButton>
                                </div>
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
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, docType: e.target.value }))}
                                                >
                                                    <option value="document">Document(pdf, doc, docx)</option>
                                                    <option value="form">Question From</option>
                                                    <option value="picture">Picture</option>
                                                    <option value="other">Other</option>
                                                </CFormSelect>
                                            </CCol>
                                            <CCol md={6}>
                                                <CFormLabel>Response By *</CFormLabel>
                                                <CFormSelect
                                                    value={newRequirement.type}
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, type: e.target.value }))}
                                                >
                                                    <option value="user">User Document (No upload required)</option>
                                                    <option value="ooshas">Ooshas Document (Upload required)</option>
                                                </CFormSelect>
                                            </CCol>

                                            <CCol md={6}>
                                                <CFormLabel>Required Status *</CFormLabel>
                                                <CFormSelect
                                                    value={newRequirement.required}
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, required: e.target.value }))}
                                                >
                                                    <option value="required">Required</option>
                                                    <option value="optional">Optional</option>
                                                </CFormSelect>
                                            </CCol>

                                            <CCol md={6}>
                                                <CFormLabel>Document Name *</CFormLabel>
                                                <CFormInput
                                                    type="text"
                                                    placeholder="e.g., Passport Copy, IELTS Score, Transcript, Statement of Purpose"
                                                    value={newRequirement.name}
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, name: e.target.value }))}
                                                />
                                            </CCol>

                                            <CCol md={12}>
                                                <CFormLabel>Description</CFormLabel>
                                                <CKEditorComponent
                                                    value={newRequirement.description}
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e }))}
                                                    placeholder="Additional description or instructions for this document"
                                                />
                                                {/* <CFormTextarea
                                                    rows="2"
                                                    placeholder="Additional description or instructions for this document"
                                                    value={newRequirement.description}
                                                    onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                                                /> */}
                                            </CCol>

                                            {newRequirement.type === 'ooshas' && newRequirement.docType != 'form' && (
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
                                                                <a href={newRequirement.docUrl} target="_blank" rel="noopener noreferrer">
                                                                    View uploaded file
                                                                </a>
                                                            </small>
                                                        </div>
                                                    )}
                                                    <small className="text-muted">Supported formats: PDF, JPG, PNG (Max 5MB)</small>
                                                </CCol>
                                            )}

                                            {newRequirement.docType === 'form' && (
                                                <CCol md={12}>
                                                    <CFormLabel>Form Fields *</CFormLabel>

                                                    {[...newRequirement.extra].map((field, index) => (
                                                        <div key={index} className="border p-3 mb-3 rounded">

                                                            <CRow>
                                                                <CCol md={3}>
                                                                    <CFormLabel>Label</CFormLabel>
                                                                    <CFormInput
                                                                        value={field.label}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(index, "label", e.target.value)
                                                                        }
                                                                        placeholder="Enter field label"
                                                                    />
                                                                </CCol>

                                                                <CCol md={3}>
                                                                    <CFormLabel>Type</CFormLabel>
                                                                    <CFormSelect
                                                                        value={field.type}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(index, "type", e.target.value)
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
                                                                            handleFieldChange(index, "required", e.target.checked)
                                                                        }
                                                                        label="Yes"
                                                                    />
                                                                </CCol>

                                                                <CCol md={3}>
                                                                    <CFormLabel>Validation</CFormLabel>
                                                                    <CFormInput
                                                                        value={field.validation}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(index, "validation", e.target.value)
                                                                        }
                                                                        placeholder="e.g. min:3, max:10"
                                                                    />
                                                                </CCol>

                                                                <CCol md={1} className="d-flex align-items-end">
                                                                    <CButton
                                                                        color="danger"
                                                                        onClick={() => handleRemoveField(index)}
                                                                    >
                                                                        X
                                                                    </CButton>
                                                                </CCol>
                                                            </CRow>

                                                        </div>
                                                    ))}

                                                    <CButton color="primary" onClick={handleAddField}>
                                                        + Add Field
                                                    </CButton>
                                                </CCol>
                                            )}

                                            {/* {newRequirement.type === 'user' && newRequirement.docType === 'document' && (
                                                <CCol md={12}>
                                                    <CFormLabel>Document URL (Optional)</CFormLabel>
                                                    <CFormInput
                                                        type="url"
                                                        placeholder="https://example.com/document.pdf"
                                                        value={newRequirement.docUrl}
                                                        onChange={(e) => setNewRequirement(prev => ({ ...prev, docUrl: e.target.value }))}
                                                    />
                                                    <small className="text-muted">You can provide a link to an external document if available</small>
                                                </CCol>
                                            )} */}

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
                                                                status: 'Pending'
                                                            })
                                                        }}
                                                    >
                                                        Cancel
                                                    </CButton>
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        onClick={handleAddRequirement}
                                                    >
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
                                    No documents added yet. Click "Create Document Requirement" to add required documents.
                                </CAlert>
                            ) : (
                                <table className="table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ padding: "6px" }} scope="col">Document Name</th>
                                            <th style={{ padding: "6px" }} scope="col">Type</th>
                                            <th style={{ padding: "6px" }} scope="col">Required</th>
                                            <th style={{ padding: "6px" }} scope="col">Description</th>
                                            <th style={{ padding: "6px" }} scope="col">Status</th>
                                            <th style={{ padding: "6px" }} scope="col">Reject Reason</th>
                                            <th style={{ padding: "6px" }} scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.documents.map((doc, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: "6px" }}>
                                                    <strong>{doc.name}</strong>
                                                    {doc.docUrl && (
                                                        <div>
                                                            <small>
                                                                <a href={`http://localhost:5000${doc.docUrl}`} target="_blank" rel="noopener noreferrer">
                                                                    View Document
                                                                </a>
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    <span className={`badge ${doc.type === 'ooshas' ? 'bg-primary' : 'bg-secondary'}`}>
                                                        {doc.type === 'ooshas' ? 'Ooshas Document' : 'User Document'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    <span className={`badge ${doc.required === 'required' ? 'bg-danger' : 'bg-info'}`}>
                                                        {doc.required === 'required' ? 'Required' : 'Optional'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    <div
                                                        className="line-clamp"
                                                        dangerouslySetInnerHTML={{ __html: doc.description }}
                                                    />
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    {/* ⚠️ Ensure getDocumentStatusBadge returns standard HTML/JSX, not CoreUI components */}
                                                    {getDocumentStatusBadge(doc.status)}
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    {doc.rejectReason && <small className="text-danger">{doc.rejectReason}</small>}
                                                </td>
                                                <td style={{ padding: "6px" }}>
                                                    <div
                                                        className="position-relative"
                                                        ref={openDropdownIndex === index ? dropdownRef : null}
                                                    >
                                                        <div className="d-flex gap-1">
                                                            {/* Manual Dropdown Toggle */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-info"
                                                                onClick={() => {
                                                                    setSelectedDoc(doc);
                                                                    setShowDocDetail(true);
                                                                }}
                                                            >
                                                                <CIcon icon={cilViewModule} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                                                                onClick={() => toggleDropdown(index)}
                                                            >
                                                                Status
                                                                <CIcon icon={cilChevronBottom} size="sm" />
                                                            </button>

                                                            {/* Manual Remove Button */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleRemoveRequirement(index)}
                                                                title="Remove Document"
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </button>
                                                        </div>

                                                        {/* Manual Dropdown Menu */}
                                                        {openDropdownIndex === index && (
                                                            <div
                                                                className="dropdown-menu show position-absolute"
                                                                style={{
                                                                    zIndex: 1050,
                                                                    right: 0,
                                                                    minWidth: '160px',
                                                                    backgroundColor: '#fff',
                                                                    border: '1px solid rgba(0,0,0,.15)',
                                                                    borderRadius: '0.25rem',
                                                                    boxShadow: '0 0.5rem 1rem rgba(0,0,0,.175)',
                                                                    padding: '0.5rem 0',
                                                                    marginTop: '0.125rem'
                                                                }}
                                                            >
                                                                <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => handleStatusSelect(index, 'Pending')}
                                                                >
                                                                    <CIcon icon={cilClock} className="me-2" /> Pending
                                                                </button>
                                                                <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => handleStatusSelect(index, 'inreview')}
                                                                >
                                                                    <CIcon icon={cilHistory} className="me-2" /> In Review
                                                                </button>
                                                                <button
                                                                    className="dropdown-item d-flex align-items-center"
                                                                    onClick={() => handleStatusSelect(index, 'Approved')}
                                                                >
                                                                    <CIcon icon={cilCheckCircle} className="me-2" /> Approved
                                                                </button>
                                                                <button
                                                                    className="dropdown-item d-flex align-items-center text-danger"
                                                                    onClick={() => handleStatusSelect(index, 'Rejected')}
                                                                >
                                                                    <CIcon icon={cilBan} className="me-2" /> Rejected
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CTabPane>

                        {/* Tab 3: Backup Courses & Rejection Reasons */}
                        <CTabPane visible={activeTab === 2}>
                            {/* Backup Courses Section */}
                            <CCard className="mb-4">
                                <CCardHeader>
                                    <h6 className="mb-0">Backup Courses</h6>
                                </CCardHeader>
                                <CCardBody>
                                    <CRow className="g-3 mb-3">
                                        <CCol md={5}>
                                            <CFormSelect
                                                value={newBackup.course}
                                                onChange={(e) => setNewBackup(prev => ({ ...prev, course: e.target.value }))}
                                            >
                                                <option value="">Select Backup Course</option>
                                                {availableCourses.map(course => (
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
                                                onChange={(e) => setNewBackup(prev => ({ ...prev, intake: e.target.value }))}
                                            />
                                        </CCol>
                                        <CCol md={3}>
                                            <CButton color="primary" onClick={handleAddBackup}>
                                                <CIcon icon={cilPlus} /> Add Backup
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
                                                                {availableCourses.find(c => c._id === backup.course)?.name || backup.course}
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
                                                                <CIcon icon={cilActionUndo} /> Switch
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

                            {/* Rejection Reasons Section */}
                            <CCard>
                                <CCardHeader>
                                    <h6 className="mb-0">Course Rejection Reasons</h6>
                                </CCardHeader>
                                <CCardBody>
                                    <CRow className="g-3 mb-3">
                                        <CCol md={5}>
                                            <CFormSelect
                                                value={newRejection.course}
                                                onChange={(e) => setNewRejection(prev => ({ ...prev, course: e.target.value }))}
                                            >
                                                <option value="">Select Course</option>
                                                <option value={application.course?._id}>
                                                    Main: {application.course?.name}
                                                </option>
                                                {formData.backups?.map((backup, idx) => (
                                                    <option key={idx} value={backup.course}>
                                                        Backup: {availableCourses.find(c => c._id === backup.course)?.name}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={5}>
                                            <CFormInput
                                                type="text"
                                                placeholder="Rejection reason"
                                                value={newRejection.reason}
                                                onChange={(e) => setNewRejection(prev => ({ ...prev, reason: e.target.value }))}
                                            />
                                        </CCol>
                                        <CCol md={2}>
                                            <CButton color="warning" onClick={handleAddRejection}>
                                                Add Reason
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
                                                                : `Backup: ${availableCourses.find(c => c._id === reason.course)?.name || reason.course}`
                                                            }
                                                        </CTableDataCell>
                                                        <CTableDataCell>{reason.reason}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <CFormSelect
                                                                size="sm"
                                                                value={reason.status}
                                                                onChange={(e) => handleUpdateRejection(index, 'status', e.target.value)}
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
                                                <option value="Withdrawn">Withdrawn</option>
                                                <option value="PreArrival">Pre-Arrival</option>
                                                <option value="Arrived">Arrived</option>
                                                <option value="Completed">Completed</option>
                                            </CFormSelect>
                                        </CCol>

                                        {/* <CCol md={6}>
                                            <CFormLabel>Payment Status</CFormLabel>
                                            <CFormSelect
                                                name="paymentStatus"
                                                value={formData.paymentStatus}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Failed">Failed</option>
                                            </CFormSelect>
                                        </CCol> */}

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
                                                value={typeof formData.extraRequirements === 'object'
                                                    ? JSON.stringify(formData.extraRequirements, null, 2)
                                                    : formData.extraRequirements
                                                }
                                                onChange={(e) => handleExtraRequirementsChange(e.target.value)}
                                                placeholder='{
  "additionalDocs": ["Statement of Purpose", "Recommendation Letter"],
  "deadline": "2025-12-31",
  "notes": "Any special requirements"
}'
                                            />
                                        </CCol>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CTabPane>
                    </CTabContent>
                </CModalBody>

                <CModalFooter className='container'>
                    <div className="d-flex justify-content-between w-100">
                        <div>
                            <CButton color="secondary" onClick={onClose}>
                                Close
                            </CButton>
                        </div>
                        <div className="d-flex gap-2">
                            <CButton color="primary" onClick={handleSaveChanges} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-2" /> Save Changes</>}
                            </CButton>
                            {activeTab < 3 && (
                                <CButton color="primary" onClick={() => setActiveTab(activeTab + 1)}>
                                    Next
                                </CButton>
                            )}
                        </div>
                    </div>
                </CModalFooter>
            </CModal>
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