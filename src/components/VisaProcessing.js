// VisaProcessing.jsx
import React, { useState, useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CRow,
    CCol,
    CFormLabel,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CButton,
    CBadge,
    CAlert,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilPlus,
    cilSave,
    cilLoop,
    cilCalendar,
    cilDollar,
    cilFingerprint,
    cilFile,
    cilCreditCard,
    cilBrowser,
    cilBuilding,
    cilClock,
    cilTrash,
    cilCloudUpload,
    cilArrowTop,
    cilLocationPin,
    cilBriefcase,

} from '@coreui/icons';
import axiosInstance from '../services/apiService';

const defaultVisaData = {
    userId: "",
    application: "",
    visaDetails: {
        category: "",
        country: "",
        embassy: "",
        purpose: "",
        intake: "",
    },
    steps: [],
    documents: [],
    biometrics: {
        status: "Pending",
        completedDate: null,
        validityPeriod: "",
        otherinfo: {},
    },
    financialInfo: {
        paymentStatus: "Pending",
        method: "",
        accountNumber: "",
        totalamount: 0,
        currency: "USD",
        otherinfo: {},
    },
};

export default function VisaProcessing({ data, application, onUpdate }) {
    const [formData, setFormData] = useState(() => {
        if (data) {
            return {
                ...defaultVisaData,
                ...data,
                _id: data._id || undefined,
                userId: data.userId?._id || data.userId || defaultVisaData.userId,
                application: data.application?._id || data.application || defaultVisaData.application,
                visaDetails: { ...defaultVisaData.visaDetails, ...data.visaDetails },
                steps: Array.isArray(data.steps) ? data.steps : [],
                documents: Array.isArray(data.documents) ? data.documents : [],
                biometrics: { ...defaultVisaData.biometrics, ...data.biometrics },
                financialInfo: { ...defaultVisaData.financialInfo, ...data.financialInfo },
            };
        }
        return defaultVisaData;
    });

    const [expandedSections, setExpandedSections] = useState({
        visa: true,
        steps: true,
        documents: true,
        biometrics: true,
        financial: true,
    });

    const [uploading, setUploading] = useState({});
    const [showAddStep, setShowAddStep] = useState(false);
    const [showAddDocument, setShowAddDocument] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle");
    const [saveMessage, setSaveMessage] = useState("");

    const [newStep, setNewStep] = useState({
        title: "",
        description: "",
        date: "",
        status: "Pending",
    });

    const [newDocument, setNewDocument] = useState({
        name: "",
        status: "Pending",
        data: {},
    });

    useEffect(() => {
        if (data) {
            setFormData(prev => ({
                ...prev,
                ...data,
                _id: data._id || prev._id,
                userId: data.userId?._id || application?.student?._id || prev.userId,
                application: data?.application?._id || data?.application || application?._id || prev.application,
                visaDetails: {
                    ...prev.visaDetails,
                    ...data.visaDetails,
                    country: application?.country || data.visaDetails?.country || prev.visaDetails?.country,
                    intake: application?.intake || data.visaDetails?.intake || prev.visaDetails?.intake,
                },
                steps: Array.isArray(data.steps) ? data.steps : prev.steps || [],
                documents: Array.isArray(data.documents) ? data.documents : prev.documents || [],
                biometrics: data.biometrics || prev.biometrics || defaultVisaData.biometrics,
                financialInfo: data.financialInfo || prev.financialInfo || defaultVisaData.financialInfo,
            }));
        } else if (application) {
            setFormData(prev => ({
                ...prev,
                userId: application?.student?._id || prev.userId,
                application: application._id || prev.application,
                visaDetails: {
                    ...prev.visaDetails,
                    country: application.country || prev.visaDetails?.country,
                    intake: application.intake || prev.visaDetails?.intake,
                },
            }));
        }
    }, [data, application]);

    useEffect(() => {
        if (saveStatus === "saved" || saveStatus === "error") {
            const timer = setTimeout(() => {
                setSaveStatus("idle");
                setSaveMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Visa Handlers
    const handleVisaChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            visaDetails: { ...prev.visaDetails, [field]: value },
        }));
    };

    // Step Handlers
    const handleStepStatusChange = (index, status) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) =>
                i === index ? { ...step, status, completedAt: status === "Completed" ? new Date() : step.completedAt } : step
            ),
        }));
    };

    const handleStepTitleChange = (index, title) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => (i === index ? { ...step, title } : step)),
        }));
    };

    const handleStepDescriptionChange = (index, description) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const currentStepDetails = step.stepDetails;
                    let updatedStepDetails;
                    if (Array.isArray(currentStepDetails)) {
                        updatedStepDetails = currentStepDetails.length > 0
                            ? [{ ...currentStepDetails[0], description }, ...currentStepDetails.slice(1)]
                            : [{ description }];
                    } else if (currentStepDetails && typeof currentStepDetails === "object") {
                        updatedStepDetails = { ...currentStepDetails, description };
                    } else {
                        updatedStepDetails = { description };
                    }
                    return { ...step, stepDetails: updatedStepDetails };
                }
                return step;
            }),
        }));
    };

    const handleAddStep = () => {
        if (newStep.title?.trim()) {
            setFormData(prev => ({
                ...prev,
                steps: [
                    ...prev.steps,
                    {
                        title: newStep.title,
                        status: newStep.status,
                        stepDetails: newStep.description ? [{ description: newStep.description }] : [],
                        date: newStep.date,
                        completedAt: newStep.status === "Completed" ? new Date() : null,
                    },
                ],
            }));
            setNewStep({ title: "", description: "", date: "", status: "Pending" });
            setShowAddStep(false);
        }
    };

    const handleRemoveStep = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index),
        }));
    };

    // Document Handlers
    const handleDocumentStatusChange = (index, status) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, i) => (i === index ? { ...doc, status } : doc)),
        }));
    };

    const handleDocumentNameChange = (index, name) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, i) => (i === index ? { ...doc, name } : doc)),
        }));
    };

    const handleDocumentDataChange = (index, data) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === index ? { ...doc, data: { ...doc.data, ...data } } : doc
            ),
        }));
    };

    const handleFileUpload = async (index, file) => {
        if (file.size > 5 * 1024 * 1024) {
            setSaveMessage("File size must be less than 5MB");
            return;
        }

        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axiosInstance.post('/upload', formData);

            if (response.data?.success && response.data?.docUrl) {
                handleDocumentDataChange(index, {
                    documentUrl: response.data.docUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    uploadDate: new Date().toISOString(),
                });
                setSaveMessage(`${file.name} uploaded successfully`);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setSaveMessage("Upload failed. Please try again.");
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleAddDocument = () => {
        if (newDocument.name?.trim()) {
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, { name: newDocument.name, status: newDocument.status, data: newDocument.data || {} }],
            }));
            setNewDocument({ name: "", status: "Pending", data: {} });
            setShowAddDocument(false);
        }
    };

    const handleRemoveDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index),
        }));
    };

    // Biometrics Handlers
    const handleBiometricsChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            biometrics: { ...prev.biometrics, [field]: value },
        }));
    };

    const handleBiometricsOtherInfoChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            biometrics: {
                ...prev.biometrics,
                otherinfo: { ...prev.biometrics.otherinfo, [key]: value },
            },
        }));
    };

    // Financial Handlers
    const handleFinancialChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            financialInfo: { ...prev.financialInfo, [field]: value },
        }));
    };

    const handleFinancialOtherInfoChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            financialInfo: {
                ...prev.financialInfo,
                otherinfo: { ...prev.financialInfo.otherinfo, [key]: value },
            },
        }));
    };

    // Submit Handler
    const handleSubmit = async () => {
        setSaveStatus("saving");
        setSaveMessage("Saving changes...",formData);

        try {
            const payload = {
                visaDetails: formData.visaDetails,
                steps: formData.steps,
                documents: formData.documents,
                biometrics: formData.biometrics,
                financialInfo: formData.financialInfo,
            };

            let response;

            if (formData._id) {
              console.log({
                    ...payload,
                    userId: formData.userId,
                    application: formData.application,
                })
                response = await axiosInstance.patch(`/visa/${formData._id}`, {
                    ...payload,
                    userId: formData.userId,
                    application: formData.application,
                });
            } else {
                response = await axiosInstance.post("/visa", {
                    ...payload,
                    userId: formData.userId,
                    application: formData.application,
                });
            }

            if (response.data) {
                setFormData(prev => ({ ...prev, ...response.data, _id: response.data._id || prev._id }));
                if (onUpdate) onUpdate();
            }

            setSaveStatus("saved");
            setSaveMessage("Changes saved successfully!");
        } catch (error) {
            console.error("Update failed:", error);
            setSaveStatus("error");
            setSaveMessage("Failed to save changes. Please try again.");
        }
    };

    const getStepDescription = (step) => {
        if (!step.stepDetails) return "";
        if (Array.isArray(step.stepDetails) && step.stepDetails.length > 0) {
            return step.stepDetails[0]?.description || "";
        }
        if (typeof step.stepDetails === "object" && step.stepDetails.description) {
            return step.stepDetails.description;
        }
        return "";
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
            case "completed":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <div className="position-relative">
            {/* Save Status Toast */}
            {saveMessage && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <CAlert color={saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "info"} dismissible>
                        {saveMessage}
                    </CAlert>
                </div>
            )}

            <div className="space-y-4">
                {/* Section 1: Visa Details */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center" onClick={() => toggleSection("visa")} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CIcon icon={cilBrowser} className="text-primary" />
                            <h6 className="mb-0">Visa Details</h6>
                            <CBadge color="danger">Required</CBadge>
                        </div>
                        <CIcon icon={expandedSections.visa ? cilLoop : cilLoop} style={{ transform: expandedSections.visa ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </CCardHeader>
                    {expandedSections.visa && (
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Category *</CFormLabel>
                                    <CFormInput
                                        value={formData.visaDetails?.category || ""}
                                        placeholder="Student Visa"
                                        onChange={(e) => handleVisaChange('category', e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Embassy</CFormLabel>
                                    <CFormInput
                                        value={formData.visaDetails?.embassy || ""}
                                        onChange={(e) => handleVisaChange("embassy", e.target.value)}
                                        placeholder="e.g., Canadian Embassy Delhi"
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel>Purpose</CFormLabel>
                                    <CFormTextarea
                                        rows={2}
                                        value={formData.visaDetails?.purpose || ""}
                                        onChange={(e) => handleVisaChange("purpose", e.target.value)}
                                        placeholder="e.g., Higher Education at University of Toronto - Bachelor of Computer Science"
                                    />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}
                </CCard>

                {/* Section 2: Visa Processing Steps */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center" onClick={() => toggleSection("steps")} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CIcon icon={cilClock} className="text-info" />
                            <h6 className="mb-0">Visa Processing Steps</h6>
                            <CBadge color="secondary">{formData.steps.length} steps</CBadge>
                        </div>
                        <CIcon icon={expandedSections.steps ? cilLoop : cilLoop} style={{ transform: expandedSections.steps ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </CCardHeader>
                    {expandedSections.steps && (
                        <CCardBody>
                            <div className="space-y-3">
                                {formData.steps.map((step, idx) => (
                                    <div key={step._id || idx} className="p-3 bg-light rounded">
                                        <CRow className="g-2 mb-2">
                                            <CCol md={5}>
                                                <CFormInput
                                                    value={step.title}
                                                    onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                                                    placeholder="Step title"
                                                />
                                            </CCol>
                                            <CCol md={3}>
                                                <CFormSelect
                                                    value={step.status}
                                                    onChange={(e) => handleStepStatusChange(idx, e.target.value)}
                                                    color={getStatusColor(step.status)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                </CFormSelect>
                                            </CCol>
                                            <CCol md={2}>
                                                {step.completedAt && (
                                                    <div className="text-muted small">
                                                        <CIcon icon={cilCalendar} className="me-1" />
                                                        {new Date(step.completedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </CCol>
                                            <CCol md={2} className="text-end">
                                                <CButton color="danger" size="sm" variant="outline" onClick={() => handleRemoveStep(idx)}>
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                        <CFormTextarea
                                            value={getStepDescription(step)}
                                            onChange={(e) => handleStepDescriptionChange(idx, e.target.value)}
                                            rows={2}
                                            placeholder="Step description (e.g., Submit application online with all required documents)"
                                        />
                                    </div>
                                ))}

                                {showAddStep ? (
                                    <div className="p-3 bg-light border rounded">
                                        <CRow className="g-2 mb-2">
                                            <CCol md={12}>
                                                <CFormInput
                                                    value={newStep.title}
                                                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                                                    placeholder="Step title (e.g., Interview)"
                                                />
                                            </CCol>
                                            <CCol md={12}>
                                                <CFormTextarea
                                                    value={newStep.description}
                                                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                                                    rows={2}
                                                    placeholder="Step description (e.g., Schedule and attend visa interview at embassy)"
                                                />
                                            </CCol>
                                            <CCol md={6}>
                                                <CFormInput
                                                    type="date"
                                                    value={newStep.date}
                                                    onChange={(e) => setNewStep({ ...newStep, date: e.target.value })}
                                                />
                                            </CCol>
                                            <CCol md={6}>
                                                <CFormSelect
                                                    value={newStep.status}
                                                    onChange={(e) => setNewStep({ ...newStep, status: e.target.value })}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>
                                        <div className="d-flex gap-2">
                                            <CButton color="primary" size="sm" onClick={handleAddStep}>
                                                <CIcon icon={cilPlus} className="me-1" /> Add Step
                                            </CButton>
                                            <CButton color="secondary" size="sm" onClick={() => setShowAddStep(false)}>
                                                Cancel
                                            </CButton>
                                        </div>
                                    </div>
                                ) : (
                                    <CButton color="link" onClick={() => setShowAddStep(true)}>
                                        <CIcon icon={cilPlus} className="me-1" /> Add Step
                                    </CButton>
                                )}
                            </div>
                        </CCardBody>
                    )}
                </CCard>

                {/* Section 3: Documents */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center" onClick={() => toggleSection("documents")} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CIcon icon={cilFile} className="text-success" />
                            <h6 className="mb-0">Documents</h6>
                            <CBadge color="secondary">{formData.documents.length} documents</CBadge>
                        </div>
                        <CIcon icon={expandedSections.documents ? cilLoop : cilLoop} style={{ transform: expandedSections.documents ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </CCardHeader>
                    {expandedSections.documents && (
                        <CCardBody>
                            <div className="space-y-3">
                                {formData.documents.map((doc, idx) => (
                                    <div key={doc._id || idx} className="p-3 bg-light rounded">
                                        <CRow className="g-2 mb-2">
                                            <CCol md={5}>
                                                <CFormInput
                                                    value={doc.name}
                                                    onChange={(e) => handleDocumentNameChange(idx, e.target.value)}
                                                    placeholder="Document name"
                                                />
                                            </CCol>
                                            <CCol md={3}>
                                                <CFormSelect
                                                    value={doc.status}
                                                    onChange={(e) => handleDocumentStatusChange(idx, e.target.value)}
                                                    color={getStatusColor(doc.status)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </CFormSelect>
                                            </CCol>
                                            <CCol md={4} className="text-end">
                                                <CButton color="danger" size="sm" variant="outline" onClick={() => handleRemoveDocument(idx)}>
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                        <div className="mt-2">
                                            <CFormInput
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                                                disabled={uploading[idx]}
                                            />
                                            {uploading[idx] && <CSpinner size="sm" className="mt-2" />}
                                            {doc.data?.documentUrl && !uploading[idx] && (
                                                <div className="mt-2">
                                                    <a href={doc.data.documentUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                        <CIcon icon={cilArrowTop} className="me-1" />
                                                        {doc.data.fileName || "View Document"}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {showAddDocument ? (
                                    <div className="p-3 bg-light border rounded">
                                        <CFormInput
                                            className="mb-2"
                                            value={newDocument.name}
                                            onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                                            placeholder="Document name (e.g., IELTS Certificate)"
                                        />
                                        <CFormSelect
                                            className="mb-2"
                                            value={newDocument.status}
                                            onChange={(e) => setNewDocument({ ...newDocument, status: e.target.value })}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </CFormSelect>
                                        <div className="d-flex gap-2">
                                            <CButton color="primary" size="sm" onClick={handleAddDocument}>
                                                <CIcon icon={cilPlus} className="me-1" /> Add Document
                                            </CButton>
                                            <CButton color="secondary" size="sm" onClick={() => setShowAddDocument(false)}>
                                                Cancel
                                            </CButton>
                                        </div>
                                    </div>
                                ) : (
                                    <CButton color="link" onClick={() => setShowAddDocument(true)}>
                                        <CIcon icon={cilPlus} className="me-1" /> Add Document
                                    </CButton>
                                )}
                            </div>
                        </CCardBody>
                    )}
                </CCard>

                {/* Section 4: Biometrics Information */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center" onClick={() => toggleSection("biometrics")} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CIcon icon={cilFingerprint} className="text-purple" />
                            <h6 className="mb-0">Biometrics Information</h6>
                        </div>
                        <CIcon icon={expandedSections.biometrics ? cilLoop : cilLoop} style={{ transform: expandedSections.biometrics ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </CCardHeader>
                    {expandedSections.biometrics && (
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Status</CFormLabel>
                                    <CFormSelect
                                        value={formData.biometrics.status}
                                        onChange={(e) => handleBiometricsChange("status", e.target.value)}
                                        color={getStatusColor(formData.biometrics.status)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Completed Date</CFormLabel>
                                    <CFormInput
                                        type="date"
                                        value={formData.biometrics.completedDate ? new Date(formData.biometrics.completedDate).toISOString().split("T")[0] : ""}
                                        onChange={(e) => handleBiometricsChange("completedDate", e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Validity Period</CFormLabel>
                                    <CFormInput
                                        value={formData.biometrics.validityPeriod || ""}
                                        onChange={(e) => handleBiometricsChange("validityPeriod", e.target.value)}
                                        placeholder="e.g., 10 Years"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Biometrics Center</CFormLabel>
                                    <CFormInput
                                        value={formData.biometrics.otherinfo?.center || ""}
                                        onChange={(e) => handleBiometricsOtherInfoChange("center", e.target.value)}
                                        placeholder="e.g., Delhi VAC"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Appointment Date</CFormLabel>
                                    <CFormInput
                                        type="date"
                                        value={formData.biometrics.otherinfo?.appointmentDate || ""}
                                        onChange={(e) => handleBiometricsOtherInfoChange("appointmentDate", e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Appointment Time</CFormLabel>
                                    <CFormInput
                                        type="time"
                                        value={formData.biometrics.otherinfo?.appointmentTime || ""}
                                        onChange={(e) => handleBiometricsOtherInfoChange("appointmentTime", e.target.value)}
                                    />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}
                </CCard>

                {/* Section 5: Financial Information */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center" onClick={() => toggleSection("financial")} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CIcon icon={cilDollar} className="text-warning" />
                            <h6 className="mb-0">Financial Information</h6>
                        </div>
                        <CIcon icon={expandedSections.financial ? cilLoop : cilLoop} style={{ transform: expandedSections.financial ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </CCardHeader>
                    {expandedSections.financial && (
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Payment Status</CFormLabel>
                                    <CFormSelect
                                        value={formData.financialInfo.paymentStatus}
                                        onChange={(e) => handleFinancialChange("paymentStatus", e.target.value)}
                                        color={getStatusColor(formData.financialInfo.paymentStatus)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Payment Method</CFormLabel>
                                    <CFormSelect
                                        value={formData.financialInfo.method || ""}
                                        onChange={(e) => handleFinancialChange("method", e.target.value)}
                                    >
                                        <option value="">Select Method</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Cash">Cash</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Total Amount</CFormLabel>
                                    <div className="d-flex">
                                        <span className="me-2 mt-2">{formData.financialInfo.currency || "USD"}</span>
                                        <CFormInput
                                            type="number"
                                            value={formData.financialInfo.totalamount || 0}
                                            onChange={(e) => handleFinancialChange("totalamount", parseFloat(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Currency</CFormLabel>
                                    <CFormSelect
                                        value={formData.financialInfo.currency || ""}
                                        onChange={(e) => handleFinancialChange("currency", e.target.value)}
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="AUD">AUD - Australian Dollar</option>
                                        <option value="INR">INR - Indian Rupee</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Account Number</CFormLabel>
                                    <CFormInput
                                        value={formData.financialInfo.accountNumber || ""}
                                        onChange={(e) => handleFinancialChange("accountNumber", e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Transaction ID</CFormLabel>
                                    <CFormInput
                                        value={formData.financialInfo.otherinfo?.transactionId || ""}
                                        onChange={(e) => handleFinancialOtherInfoChange("transactionId", e.target.value)}
                                        placeholder="TXN123456"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Bank Name</CFormLabel>
                                    <CFormInput
                                        value={formData.financialInfo.otherinfo?.bankName || ""}
                                        onChange={(e) => handleFinancialOtherInfoChange("bankName", e.target.value)}
                                        placeholder="e.g., TD Bank"
                                    />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}
                </CCard>
            </div>

            {/* Save Button */}
            <div className="position-fixed bottom-0 end-0 p-3 z-30">
                <CButton color="primary" onClick={handleSubmit} disabled={saveStatus === "saving"}>
                    {saveStatus === "saving" ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
                    Save changes
                </CButton>
            </div>
        </div>
    );
}