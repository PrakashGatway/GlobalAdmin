// VisaProcessing.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
    CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilPlus,
    cilSave,
    cilLoop,
    cilBrowser,
    cilClock,
    cilTrash,
    cilCloudUpload,
    cilInfo,
    cilCheckCircle,
    cilWarning,
    cilText,
    cilSettings,
    cilList,
    cilHistory,
    cilFile,
} from '@coreui/icons';
import apiService from '../../services/apiService';
import countryService from '../../services/countryService';

// Default steps data structure
const getDefaultSteps = () => [
    {
      id: 1,
      label: "APS Applied",
      route: "aps-applied",
      page: {
        title: "APS Application",
        status: "In Progress",
        subtitle: "Complete your APS process to proceed with visa application."
      },
      banner: {
        type: "info",
        title: "Your APS application is in progress.",
        subtitle: "Complete your APS process to proceed with visa application.",
        action: "View APS Application",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "APS Application Overview",
          updated: "09 Jul 2024",
          details: [
            { label: "APS Application No.", value: "", highlight: false },
            { label: "Date of APS Application", value: "", highlight: false },
            { label: "APS Status", value: "", highlight: true },
            { label: "Evaluating Authority", value: "", highlight: false },
            { label: "Degree", value: "", highlight: false },
            { label: "University", value: "", highlight: false },
            { label: "Program", value: "", highlight: false },
            { label: "Documents Submitted", value: "", highlight: false },
            { label: "Payment Status", value: "", highlight: true },
            { label: "Estimated Result Date", value: "", highlight: false }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    },
    {
      id: 2,
      label: "APS Approval",
      route: "aps-approval",
      page: {
        title: "APS Approval",
        status: "Pending",
        subtitle: "Waiting for APS approval."
      },
      banner: {
        type: "info",
        title: "APS certificate pending approval.",
        subtitle: "Your APS certificate is being processed.",
        action: "Track Status",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "APS Approval Details",
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: [
            { label: "Application Type", value: "", highlight: false },
            { label: "Reference ID", value: "", highlight: false },
            { label: "Certificate No.", value: "", highlight: false },
            { label: "Country", value: "", highlight: false },
            { label: "Date Applied", value: "", highlight: false },
            { label: "Status", value: "", highlight: true },
            { label: "University", value: "", highlight: false },
            { label: "Approved By", value: "", highlight: false }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    },
    {
      id: 3,
      label: "Visa Application",
      route: "visa-application",
      page: {
        title: "Visa Application",
        status: "Pending",
        subtitle: "Complete and submit your visa application for processing."
      },
      banner: {
        type: "info",
        title: "Visa Application in Progress",
        subtitle: "Please complete all sections and upload required documents.",
        action: "Continue Application",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "Visa Application Information",
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: [
            { label: "Visa Type", value: "", highlight: false },
            { label: "Visa Category", value: "", highlight: false },
            { label: "Country", value: "", highlight: false },
            { label: "Purpose of Stay", value: "", highlight: false },
            { label: "Intake", value: "", highlight: false },
            { label: "University", value: "", highlight: false },
            { label: "Program", value: "", highlight: false },
            { label: "Application Fee", value: "", highlight: true },
            { label: "Payment Status", value: "", highlight: true },
            { label: "Application No.", value: "", highlight: false },
            { label: "Current Status", value: "", highlight: true }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    },
    {
      id: 4,
      label: "Biometrics",
      route: "biometrics",
      page: {
        title: "Biometrics Appointment",
        status: "Pending",
        subtitle: "Schedule your biometrics appointment"
      },
      banner: {
        type: "info",
        title: "Biometrics Appointment Required",
        subtitle: "Please schedule and complete your biometrics appointment.",
        action: "Book Appointment",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "Biometrics Appointment Details",
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: [
            { label: "Appointment Date", value: "", highlight: false },
            { label: "Appointment Time", value: "", highlight: false },
            { label: "Center Name", value: "", highlight: false },
            { label: "Center Address", value: "", highlight: false },
            { label: "Status", value: "", highlight: true },
            { label: "Fees Paid", value: "", highlight: false }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    },
    {
      id: 5,
      label: "Visa Decision",
      route: "visa-decision",
      page: {
        title: "Visa Decision",
        status: "Pending"
      },
      banner: {
        type: "info",
        title: "Visa Under Review",
        subtitle: "Your application is being processed by the embassy.",
        action: "Track Status",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "Visa Decision Tracking",
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: [
            { label: "Visa Type", value: "", highlight: false },
            { label: "Application No.", value: "", highlight: false },
            { label: "Status", value: "", highlight: true },
            { label: "Application Received", value: "", highlight: false },
            { label: "Estimated Decision Date", value: "", highlight: false },
            { label: "Embassy", value: "", highlight: false }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    },
    {
      id: 6,
      label: "Visa Approved",
      route: "visa-approved",
      page: {
        title: "Visa Approved",
        status: "Pending"
      },
      banner: {
        type: "success",
        title: "Visa Approved!",
        subtitle: "Congratulations! Your visa has been approved.",
        action: "Download Visa Letter",
        fileUrl: "",
        fileName: ""
      },
      progress: 0,
      sections: {
        overview: {
          title: "Visa Approval Details",
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          details: [
            { label: "Visa Status", value: "", highlight: true },
            { label: "Visa Type", value: "", highlight: false },
            { label: "Visa Number", value: "", highlight: false },
            { label: "Validity From", value: "", highlight: false },
            { label: "Validity Till", value: "", highlight: false },
            { label: "Number of Entries", value: "", highlight: false }
          ]
        }
      },
      importantInfo: [],
      progressSteps: [],
      statusTimeline: []
    }
];

const defaultVisaData = {
    visaDetails: {
        category: "",
        country: "",
        embassy: "",
        purpose: "",
        intake: "",
    },
    steps: getDefaultSteps()
};

export default function VisaProcessing() {
    const [formData, setFormData] = useState(defaultVisaData);
    const [expandedSections, setExpandedSections] = useState({
        visa: true,
        steps: true,
        documents: true,
    });
    const [uploading, setUploading] = useState({});
    const [showAddStep, setShowAddStep] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle");
    const [saveMessage, setSaveMessage] = useState("");
    const [countries, setCountries] = useState([]);
    const [error, setError] = useState("");
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [selectedCountryId, setSelectedCountryId] = useState("");

    const fetchCountries = useCallback(async () => {
        setError('');
        setLoadingCountries(true);
        try {
            const res = await countryService.getCountries({
                page: 1,
                limit: 100,
            });
            if (res.success) {
                setCountries(res.data || []);
            } else {
                setError(res.message || 'Failed to fetch countries');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch countries');
        } finally {
            setLoadingCountries(false);
        }
    }, []);

    const fetchVisaDataByCountry = useCallback(async (countryId) => {
        if (!countryId) return;
        
        setSaveStatus("saving");
        setSaveMessage("Loading visa data...");
        
        try {
            const response = await apiService.get(`/countries/${countryId}`);
            if (response.data) {
                const visaData = response.data.visaSteps || {};
                setFormData(prev => ({
                    ...prev,
                    countries: countryId,
                    visaDetails: visaData.visaDetails || defaultVisaData.visaDetails,
                    steps: visaData.steps && visaData.steps.length > 0 ? visaData.steps : getDefaultSteps(),
                  
                }));
                setSaveStatus("saved");
                setSaveMessage("Visa data loaded successfully!");
            } else {
                setFormData(prev => ({
                    ...defaultVisaData,
                    countries: countryId,
                }));
                setSaveStatus("idle");
                setSaveMessage("");
            }
        } catch (error) {
            console.error("Failed to fetch visa data:", error);
            setFormData(prev => ({
                ...defaultVisaData,
                countries: countryId,
            }));
            setSaveStatus("idle");
            setSaveMessage("");
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

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

    const handleCountrySelect = async (countryId) => {
        setSelectedCountryId(countryId);
        setFormData(prev => ({ ...prev, countries: countryId }));
        await fetchVisaDataByCountry(countryId);
    };

    const handleVisaChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            visaDetails: { ...prev.visaDetails, [field]: value },
        }));
    };

    const handleStepChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => 
                i === index ? { ...step, [field]: value } : step
            ),
        }));
    };

    const handlePageChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => 
                i === index ? { ...step, page: { ...step.page, [field]: value } } : step
            ),
        }));
    };

    const handleBannerChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => 
                i === index ? { ...step, banner: { ...step.banner, [field]: value } } : step
            ),
        }));
    };

    const handleProgressChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => 
                i === index ? { ...step, progress: parseInt(value) || 0 } : step
            ),
        }));
    };

    const handleSectionDetailChange = (index, sectionName, detailIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index && step.sections?.[sectionName]) {
                    const updatedDetails = [...step.sections[sectionName].details];
                    updatedDetails[detailIndex] = {
                        ...updatedDetails[detailIndex],
                        [field]: field === 'highlight' ? value : value
                    };
                    return {
                        ...step,
                        sections: {
                            ...step.sections,
                            [sectionName]: {
                                ...step.sections[sectionName],
                                details: updatedDetails
                            }
                        }
                    };
                }
                return step;
            }),
        }));
    };

    const handleAddSectionDetail = (index, sectionName) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index && step.sections?.[sectionName]) {
                    return {
                        ...step,
                        sections: {
                            ...step.sections,
                            [sectionName]: {
                                ...step.sections[sectionName],
                                details: [
                                    ...step.sections[sectionName].details,
                                    { label: "New Field", value: "", highlight: false }
                                ]
                            }
                        }
                    };
                }
                return step;
            }),
        }));
    };

    const handleRemoveSectionDetail = (index, sectionName, detailIndex) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index && step.sections?.[sectionName]) {
                    const updatedDetails = step.sections[sectionName].details.filter((_, idx) => idx !== detailIndex);
                    return {
                        ...step,
                        sections: {
                            ...step.sections,
                            [sectionName]: {
                                ...step.sections[sectionName],
                                details: updatedDetails
                            }
                        }
                    };
                }
                return step;
            }),
        }));
    };

    // Handlers for importantInfo
    const handleImportantInfoChange = (index, infoIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedImportantInfo = [...(step.importantInfo || [])];
                    updatedImportantInfo[infoIndex] = {
                        ...updatedImportantInfo[infoIndex],
                        [field]: value
                    };
                    return { ...step, importantInfo: updatedImportantInfo };
                }
                return step;
            }),
        }));
    };

    const handleAddImportantInfo = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    return {
                        ...step,
                        importantInfo: [...(step.importantInfo || []), { title: "", description: "", type: "info" }]
                    };
                }
                return step;
            }),
        }));
    };

    const handleRemoveImportantInfo = (index, infoIndex) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedImportantInfo = step.importantInfo.filter((_, idx) => idx !== infoIndex);
                    return { ...step, importantInfo: updatedImportantInfo };
                }
                return step;
            }),
        }));
    };

    // Handlers for progressSteps
    const handleProgressStepChange = (index, stepIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedProgressSteps = [...(step.progressSteps || [])];
                    updatedProgressSteps[stepIndex] = {
                        ...updatedProgressSteps[stepIndex],
                        [field]: value
                    };
                    return { ...step, progressSteps: updatedProgressSteps };
                }
                return step;
            }),
        }));
    };

    const handleAddProgressStep = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    return {
                        ...step,
                        progressSteps: [...(step.progressSteps || []), { label: "", status: "pending", date: "" }]
                    };
                }
                return step;
            }),
        }));
    };

    const handleRemoveProgressStep = (index, stepIndex) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedProgressSteps = step.progressSteps.filter((_, idx) => idx !== stepIndex);
                    return { ...step, progressSteps: updatedProgressSteps };
                }
                return step;
            }),
        }));
    };

    // Handlers for statusTimeline
    const handleStatusTimelineChange = (index, timelineIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedTimeline = [...(step.statusTimeline || [])];
                    updatedTimeline[timelineIndex] = {
                        ...updatedTimeline[timelineIndex],
                        [field]: value
                    };
                    return { ...step, statusTimeline: updatedTimeline };
                }
                return step;
            }),
        }));
    };

    const handleAddStatusTimeline = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    return {
                        ...step,
                        statusTimeline: [...(step.statusTimeline || []), { date: "", status: "", description: "" }]
                    };
                }
                return step;
            }),
        }));
    };

    const handleRemoveStatusTimeline = (index, timelineIndex) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    const updatedTimeline = step.statusTimeline.filter((_, idx) => idx !== timelineIndex);
                    return { ...step, statusTimeline: updatedTimeline };
                }
                return step;
            }),
        }));
    };

    const handleStepFileUpload = async (index, file) => {
        if (file.size > 5 * 1024 * 1024) {
            setSaveMessage("File size must be less than 5MB");
            return;
        }

        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            const formDataFile = new FormData();
            formDataFile.append('file', file);
            const response = await apiService.post('/upload', formDataFile);

            if (response.data?.success && response.data?.docUrl) {
                handleBannerChange(index, "fileUrl", response.data.docUrl);
                handleBannerChange(index, "fileName", file.name);
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

    const [newStep, setNewStep] = useState({
        id: 0,
        label: "",
        route: "",
        page: { title: "", status: "Pending", subtitle: "" },
        banner: { type: "info", title: "", subtitle: "", action: "", fileUrl: "", fileName: "" },
        progress: 0,
        sections: { overview: { title: "", updated: "", details: [] } },
        importantInfo: [],
        progressSteps: [],
        statusTimeline: []
    });

    const handleAddStep = () => {
        if (newStep.label?.trim()) {
            const newId = Math.max(...formData.steps.map(s => s.id), 0) + 1;
            setFormData(prev => ({
                ...prev,
                steps: [
                    ...prev.steps,
                    {
                        ...newStep,
                        id: newId,
                        sections: {
                            overview: {
                                title: newStep.sections?.overview?.title || "",
                                updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                                details: newStep.sections?.overview?.details || []
                            }
                        },
                        importantInfo: [],
                        progressSteps: [],
                        statusTimeline: []
                    }
                ],
            }));
            setNewStep({
                id: 0,
                label: "",
                route: "",
                page: { title: "", status: "Pending", subtitle: "" },
                banner: { type: "info", title: "", subtitle: "", action: "", fileUrl: "", fileName: "" },
                progress: 0,
                sections: { overview: { title: "", updated: "", details: [] } },
                importantInfo: [],
                progressSteps: [],
                statusTimeline: []
            });
            setShowAddStep(false);
        }
    };

    const handleRemoveStep = (index) => {
        if (formData.steps.length <= 1) {
            setSaveMessage("Cannot delete the last step");
            return;
        }
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!formData.countries) {
            setSaveStatus("error");
            setSaveMessage("Please select a country first");
            return;
        }

        setSaveStatus("saving");
        setSaveMessage("Saving changes...");

        try {
            const payload = {
              visaSteps : {
                visaDetails: formData.visaDetails,
                steps: formData.steps
              }
            };

            const response = await apiService.put(`/countries/${formData.countries}`, payload);

            if (response.data) {
                setFormData(prev => ({ ...prev, ...response.data }));
                
                setSaveStatus("saved");
                setSaveMessage("Changes saved successfully!");
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error("Update failed:", error);
            setSaveStatus("error");
            setSaveMessage("Failed to save changes. Please try again.");
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
            case "completed":
                return "success";
            case "in progress":
                return "info";
            case "pending":
                return "warning";
            case "rejected":
                return "danger";
            default:
                return "secondary";
        }
    };

    const getBannerTypeColor = (type) => {
        switch (type) {
            case "success":
                return "success";
            case "info":
            default:
                return "info";
        }
    };

    const fileBaseurl = (url) => {
        if (!url) return "#";
        if (url.startsWith("http")) return url;
        return `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${url}`;
    };

    return (
        <div className="position-relative" style={{ paddingBottom: '80px' }}>
            {/* Save Status Toast */}
            {saveMessage && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <CAlert 
                        color={saveStatus === "saved" ? "success" : saveStatus === "error" ? "danger" : "info"} 
                        dismissible
                        onClose={() => setSaveMessage("")}
                    >
                        <div className="d-flex align-items-center gap-2">
                            {saveStatus === "saved" && <CIcon icon={cilCheckCircle} />}
                            {saveStatus === "error" && <CIcon icon={cilWarning} />}
                            {saveStatus === "saving" && <CSpinner size="sm" />}
                            {saveMessage}
                        </div>
                    </CAlert>
                </div>
            )}

            <div className="space-y-4">
                {/* Section 1: Country Selection & Visa Details */}
                <CCard className="mb-4 shadow-sm">
                    <CCardHeader 
                        className="d-flex justify-content-between align-items-center bg-white"
                        onClick={() => toggleSection("visa")} 
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 p-2 rounded">
                                <CIcon icon={cilBrowser} className="text-primary" size="lg" />
                            </div>
                            <h5 className="mb-0 fw-semibold">Visa Details</h5>
                            <CBadge color="danger" className="ms-2">Required</CBadge>
                        </div>
                        <CIcon 
                            icon={cilLoop} 
                            className={`transition-transform ${expandedSections.visa ? 'rotate-180' : ''}`}
                            style={{ transform: expandedSections.visa ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                        />
                    </CCardHeader>
                    {expandedSections.visa && (
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel className="fw-semibold">Select Country *</CFormLabel>
                                    <CFormSelect
                                        value={formData.countries}
                                        onChange={(e) => handleCountrySelect(e.target.value)}
                                        className="bg-white"
                                        disabled={loadingCountries}
                                    >
                                        <option value="">-- Select a Country --</option>
                                        {countries.map(ele => (
                                            <option key={ele._id} value={ele._id}>{ele.name}</option>
                                        ))}
                                    </CFormSelect>
                                    {loadingCountries && <CSpinner size="sm" className="mt-2" />}
                                    {error && <small className="text-danger">{error}</small>}
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel className="fw-semibold">Category *</CFormLabel>
                                    <CFormInput
                                        value={formData.visaDetails?.category || ""}
                                        placeholder="e.g., Student Visa"
                                        onChange={(e) => handleVisaChange('category', e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel className="fw-semibold">Embassy</CFormLabel>
                                    <CFormInput
                                        value={formData.visaDetails?.embassy || ""}
                                        onChange={(e) => handleVisaChange("embassy", e.target.value)}
                                        placeholder="e.g., German Embassy New Delhi"
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel className="fw-semibold">Purpose of Visit</CFormLabel>
                                    <CFormTextarea
                                        rows={3}
                                        value={formData.visaDetails?.purpose || ""}
                                        onChange={(e) => handleVisaChange("purpose", e.target.value)}
                                        placeholder="Describe the purpose of your visa application..."
                                    />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}
                </CCard>

                {/* Section 2: Visa Processing Steps */}
                <CCard className="mb-4 shadow-sm">
                    <CCardHeader 
                        className="d-flex justify-content-between align-items-center bg-white"
                        onClick={() => toggleSection("steps")} 
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-info bg-opacity-10 p-2 rounded">
                                <CIcon icon={cilClock} className="text-info" size="lg" />
                            </div>
                            <h5 className="mb-0 fw-semibold">Visa Processing Steps</h5>
                            <CBadge color="secondary" className="ms-2">{formData.steps.length} steps</CBadge>
                        </div>
                        <CIcon 
                            icon={cilLoop} 
                            className={`transition-transform ${expandedSections.steps ? 'rotate-180' : ''}`}
                            style={{ transform: expandedSections.steps ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                        />
                    </CCardHeader>
                    {expandedSections.steps && (
                        <CCardBody>
                            <div className="space-y-3">
                                {formData.steps.map((step, idx) => (
                                    <StepEditor
                                        key={step.id || idx}
                                        step={step}
                                        stepIndex={idx}
                                        onStepChange={(field, value) => handleStepChange(idx, field, value)}
                                        onPageChange={(field, value) => handlePageChange(idx, field, value)}
                                        onBannerChange={(field, value) => handleBannerChange(idx, field, value)}
                                        onProgressChange={(value) => handleProgressChange(idx, value)}
                                        onSectionDetailChange={(sectionName, detailIdx, field, value) => 
                                            handleSectionDetailChange(idx, sectionName, detailIdx, field, value)
                                        }
                                        onAddSectionDetail={(sectionName) => handleAddSectionDetail(idx, sectionName)}
                                        onRemoveSectionDetail={(sectionName, detailIdx) => 
                                            handleRemoveSectionDetail(idx, sectionName, detailIdx)
                                        }
                                        onImportantInfoChange={(infoIndex, field, value) => 
                                            handleImportantInfoChange(idx, infoIndex, field, value)
                                        }
                                        onAddImportantInfo={() => handleAddImportantInfo(idx)}
                                        onRemoveImportantInfo={(infoIndex) => handleRemoveImportantInfo(idx, infoIndex)}
                                        onProgressStepChange={(stepIndex, field, value) => 
                                            handleProgressStepChange(idx, stepIndex, field, value)
                                        }
                                        onAddProgressStep={() => handleAddProgressStep(idx)}
                                        onRemoveProgressStep={(stepIndex) => handleRemoveProgressStep(idx, stepIndex)}
                                        onStatusTimelineChange={(timelineIndex, field, value) => 
                                            handleStatusTimelineChange(idx, timelineIndex, field, value)
                                        }
                                        onAddStatusTimeline={() => handleAddStatusTimeline(idx)}
                                        onRemoveStatusTimeline={(timelineIndex) => handleRemoveStatusTimeline(idx, timelineIndex)}
                                        onFileUpload={(file) => handleStepFileUpload(idx, file)}
                                        onRemoveStep={() => handleRemoveStep(idx)}
                                        uploadingFile={uploading[idx]}
                                        getStatusBadgeColor={getStatusBadgeColor}
                                        getBannerTypeColor={getBannerTypeColor}
                                        fileBaseurl={fileBaseurl}
                                    />
                                ))}

                                {showAddStep ? (
                                    <CCard className="mt-3 border-primary">
                                        <CCardBody>
                                            <h6 className="mb-3 fw-semibold text-primary">Add New Step</h6>
                                            <CRow className="g-3">
                                                <CCol md={6}>
                                                    <CFormLabel>Step Label</CFormLabel>
                                                    <CFormInput
                                                        placeholder="e.g., Medical Examination"
                                                        value={newStep.label}
                                                        onChange={(e) => setNewStep({ ...newStep, label: e.target.value })}
                                                    />
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormLabel>Route</CFormLabel>
                                                    <CFormInput
                                                        placeholder="e.g., medical-exam"
                                                        value={newStep.route}
                                                        onChange={(e) => setNewStep({ ...newStep, route: e.target.value })}
                                                    />
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormLabel>Page Title</CFormLabel>
                                                    <CFormInput
                                                        placeholder="Medical Examination"
                                                        value={newStep.page.title}
                                                        onChange={(e) => setNewStep({ ...newStep, page: { ...newStep.page, title: e.target.value } })}
                                                    />
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormLabel>Page Status</CFormLabel>
                                                    <CFormSelect
                                                        value={newStep.page.status}
                                                        onChange={(e) => setNewStep({ ...newStep, page: { ...newStep.page, status: e.target.value } })}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Approved">Approved</option>
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormLabel>Banner Title</CFormLabel>
                                                    <CFormInput
                                                        placeholder="Medical Exam Required"
                                                        value={newStep.banner.title}
                                                        onChange={(e) => setNewStep({ ...newStep, banner: { ...newStep.banner, title: e.target.value } })}
                                                    />
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormLabel>Banner Action</CFormLabel>
                                                    <CFormInput
                                                        placeholder="Schedule Exam"
                                                        value={newStep.banner.action}
                                                        onChange={(e) => setNewStep({ ...newStep, banner: { ...newStep.banner, action: e.target.value } })}
                                                    />
                                                </CCol>
                                            </CRow>
                                            <div className="d-flex gap-2 mt-4">
                                                <CButton color="primary" onClick={handleAddStep}>
                                                    <CIcon icon={cilPlus} className="me-1" /> Add Step
                                                </CButton>
                                                <CButton color="secondary" variant="outline" onClick={() => setShowAddStep(false)}>
                                                    Cancel
                                                </CButton>
                                            </div>
                                        </CCardBody>
                                    </CCard>
                                ) : (
                                    <CButton color="link" className="mt-2" onClick={() => setShowAddStep(true)}>
                                        <CIcon icon={cilPlus} className="me-1" /> Add New Step
                                    </CButton>
                                )}
                            </div>
                        </CCardBody>
                    )}
                </CCard>
            </div>

            {/* Floating Save Button */}
            <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1000 }}>
                <CButton 
                    color="primary" 
                    onClick={handleSubmit} 
                    size="lg"
                    className="shadow-lg rounded-pill px-4"
                >
                    {saveStatus === "saving" ? (
                        <CSpinner size="sm" className="me-2" />
                    ) : (
                        <CIcon icon={cilSave} className="me-2" />
                    )}
                    Save All Changes
                </CButton>
            </div>
        </div>
    );
}

// Step Editor Component with all sections handling
function StepEditor({ 
    step, 
    stepIndex,
    onStepChange, 
    onPageChange, 
    onBannerChange, 
    onProgressChange,
    onSectionDetailChange,
    onAddSectionDetail,
    onRemoveSectionDetail,
    onImportantInfoChange,
    onAddImportantInfo,
    onRemoveImportantInfo,
    onProgressStepChange,
    onAddProgressStep,
    onRemoveProgressStep,
    onStatusTimelineChange,
    onAddStatusTimeline,
    onRemoveStatusTimeline,
    onFileUpload,
    onRemoveStep,
    uploadingFile,
    getStatusBadgeColor,
    getBannerTypeColor,
    fileBaseurl
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const statusOptions = ["Pending", "In Progress", "Completed", "Approved", "Scheduled", "Under Review"];
    const bannerTypeOptions = ["info", "success"];
    const importantInfoTypeOptions = ["info", "warning", "requirement", "success"];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const getStepColor = (id) => {
        const colors = {
            1: 'warning',
            2: 'success',
            3: 'primary',
            4: 'info',
            5: 'secondary',
            6: 'dark'
        };
        return colors[id] || 'secondary';
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onRemoveStep();
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <CCard className="mb-3 border-0 shadow-sm">
                <CCardHeader 
                    className="d-flex justify-content-between align-items-center bg-white"
                    style={{ cursor: 'pointer' }}
                >
                    <div 
                        className="d-flex align-items-center gap-3 flex-grow-1"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className={`bg-${getStepColor(step.id)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                            <span className={`fw-bold text-${getStepColor(step.id)}`}>{step.id}</span>
                        </div>
                        <div>
                            <h6 className="mb-0 fw-semibold">{step.label}</h6>
                            <small className="text-muted">Route: {step.route}</small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <CBadge color={getStatusBadgeColor(step.page?.status)} className="px-3 py-2">
                            {step.page?.status || "Pending"}
                        </CBadge>
                        {step.progress !== undefined && (
                            <div style={{ width: '100px' }}>
                                <small className="text-muted">{step.progress}%</small>
                                <div className="progress" style={{ height: '4px' }}>
                                    <div 
                                        className="progress-bar bg-primary" 
                                        style={{ width: `${step.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteClick}
                            className="me-2"
                        >
                            <CIcon icon={cilTrash} />
                        </CButton>
                        <CIcon 
                            icon={cilLoop} 
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                            onClick={() => setIsExpanded(!isExpanded)}
                        />
                    </div>
                </CCardHeader>

                {isExpanded && (
                    <CCardBody className="bg-light">
                        {/* Tab Navigation */}
                        <div className="mb-4">
                            <div className="d-flex gap-2 border-bottom pb-2 flex-wrap">
                                {[
                                    { key: 'basic', label: 'Basic Info', icon: cilInfo },
                                    { key: 'page', label: 'Page Details', icon: cilBrowser },
                                    { key: 'banner', label: 'Banner', icon: cilText },
                                    { key: 'sections', label: 'Overview', icon: cilSettings },
                                    { key: 'importantInfo', label: 'Important Info', icon: cilWarning },
                                    { key: 'progressSteps', label: 'Progress Steps', icon: cilList },
                                    { key: 'statusTimeline', label: 'Timeline', icon: cilHistory }
                                ].map((tab) => (
                                    <CButton
                                        key={tab.key}
                                        color={activeTab === tab.key ? 'primary' : 'secondary'}
                                        variant={activeTab === tab.key ? 'solid' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveTab(tab.key)}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        <CIcon icon={tab.icon} size="sm" />
                                        {tab.label}
                                    </CButton>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'basic' && (
                            <CRow className="g-3">
                                <CCol md={3}>
                                    <CFormLabel>Step ID</CFormLabel>
                                    <CFormInput
                                        type="number"
                                        value={step.id}
                                        onChange={(e) => onStepChange("id", parseInt(e.target.value))}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Route</CFormLabel>
                                    <CFormInput
                                        value={step.route}
                                        onChange={(e) => onStepChange("route", e.target.value)}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Label</CFormLabel>
                                    <CFormInput
                                        value={step.label}
                                        onChange={(e) => onStepChange("label", e.target.value)}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Progress (%)</CFormLabel>
                                    <CFormInput
                                        type="number"
                                        value={step.progress || 0}
                                        onChange={(e) => onProgressChange(e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                </CCol>
                            </CRow>
                        )}

                        {activeTab === 'page' && (
                            <div className="space-y-3">
                                <CFormLabel>Page Title</CFormLabel>
                                <CFormInput
                                    value={step.page?.title || ""}
                                    onChange={(e) => onPageChange("title", e.target.value)}
                                />
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormLabel>Page Status</CFormLabel>
                                        <CFormSelect
                                            value={step.page?.status || "Pending"}
                                            onChange={(e) => onPageChange("status", e.target.value)}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel>Subtitle</CFormLabel>
                                        <CFormInput
                                            value={step.page?.subtitle || ""}
                                            onChange={(e) => onPageChange("subtitle", e.target.value)}
                                        />
                                    </CCol>
                                </CRow>
                            </div>
                        )}

                        {activeTab === 'banner' && (
                            <div className="space-y-3">
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormLabel>Banner Type</CFormLabel>
                                        <CFormSelect
                                            value={step.banner?.type || "info"}
                                            onChange={(e) => onBannerChange("type", e.target.value)}
                                        >
                                            {bannerTypeOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                                            ))}
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel>Banner Title</CFormLabel>
                                        <CFormInput
                                            value={step.banner?.title || ""}
                                            onChange={(e) => onBannerChange("title", e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel>Banner Subtitle</CFormLabel>
                                        <CFormInput
                                            value={step.banner?.subtitle || ""}
                                            onChange={(e) => onBannerChange("subtitle", e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel>Action Button Text</CFormLabel>
                                        <CFormInput
                                            value={step.banner?.action || ""}
                                            onChange={(e) => onBannerChange("action", e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel>File Upload</CFormLabel>
                                        <div className="d-flex align-items-center gap-2">
                                            <CButton
                                                color="secondary"
                                                variant="outline"
                                                size="sm"
                                                as="label"
                                                htmlFor={`file-upload-${step.id}`}
                                                className="mb-0"
                                            >
                                                <CIcon icon={cilCloudUpload} className="me-1" />
                                                Choose File
                                            </CButton>
                                            <input
                                                type="file"
                                                id={`file-upload-${step.id}`}
                                                onChange={handleFileSelect}
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                className="d-none"
                                            />
                                            {uploadingFile && <CSpinner size="sm" />}
                                        </div>
                                        {step.banner?.fileName && (
                                            <div className="mt-2">
                                                <CBadge color="success" className="me-2">Uploaded</CBadge>
                                                <small>{step.banner.fileName}</small>
                                            </div>
                                        )}
                                        {step.banner?.fileUrl && (
                                            <div className="mt-1">
                                                <a href={fileBaseurl(step.banner.fileUrl)} target="_blank" rel="noopener noreferrer">
                                                    View File
                                                </a>
                                            </div>
                                        )}
                                    </CCol>
                                </CRow>
                            </div>
                        )}

                        {activeTab === 'sections' && step.sections?.overview?.details && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 fw-semibold">Overview Details</h6>
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onAddSectionDetail("overview")}
                                    >
                                        <CIcon icon={cilPlus} className="me-1" size="sm" />
                                        Add Detail
                                    </CButton>
                                </div>
                                <div className="space-y-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {step.sections.overview.details.map((detail, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-3 border">
                                            <CRow className="g-2 align-items-center">
                                                <CCol md={5}>
                                                    <CFormInput
                                                        value={detail.label}
                                                        onChange={(e) => onSectionDetailChange("overview", idx, "label", e.target.value)}
                                                        placeholder="Label"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={5}>
                                                    <CFormInput
                                                        value={detail.value}
                                                        onChange={(e) => onSectionDetailChange("overview", idx, "value", e.target.value)}
                                                        placeholder="Value"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={2}>
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <CButton
                                                            color={detail.highlight ? "warning" : "secondary"}
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onSectionDetailChange("overview", idx, "highlight", !detail.highlight)}
                                                        >
                                                            {detail.highlight ? "★" : "☆"}
                                                        </CButton>
                                                        <CButton
                                                            color="danger"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onRemoveSectionDetail("overview", idx)}
                                                        >
                                                            <CIcon icon={cilTrash} size="sm" />
                                                        </CButton>
                                                    </div>
                                                </CCol>
                                            </CRow>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'importantInfo' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 fw-semibold">Important Information</h6>
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        onClick={onAddImportantInfo}
                                    >
                                        <CIcon icon={cilPlus} className="me-1" size="sm" />
                                        Add Info
                                    </CButton>
                                </div>
                                <div className="space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {(step.importantInfo || []).map((info, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-3 border">
                                            <CRow className="g-2">
                                                <CCol md={4}>
                                                    <CFormInput
                                                        value={info.title || ""}
                                                        onChange={(e) => onImportantInfoChange(idx, "title", e.target.value)}
                                                        placeholder="Title"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={5}>
                                                    <CFormInput
                                                        value={info.description || ""}
                                                        onChange={(e) => onImportantInfoChange(idx, "description", e.target.value)}
                                                        placeholder="Description"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={2}>
                                                    <CFormSelect
                                                        value={info.type || "info"}
                                                        onChange={(e) => onImportantInfoChange(idx, "type", e.target.value)}
                                                        size="sm"
                                                    >
                                                        {importantInfoTypeOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                                                        ))}
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol md={1}>
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onRemoveImportantInfo(idx)}
                                                    >
                                                        <CIcon icon={cilTrash} size="sm" />
                                                    </CButton>
                                                </CCol>
                                            </CRow>
                                        </div>
                                    ))}
                                    {(!step.importantInfo || step.importantInfo.length === 0) && (
                                        <div className="text-center text-muted py-3">
                                            No important information added. Click "Add Info" to add.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'progressSteps' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 fw-semibold">Progress Steps</h6>
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        onClick={onAddProgressStep}
                                    >
                                        <CIcon icon={cilPlus} className="me-1" size="sm" />
                                        Add Step
                                    </CButton>
                                </div>
                                <div className="space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {(step.progressSteps || []).map((progressStep, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-3 border">
                                            <CRow className="g-2 align-items-center">
                                                <CCol md={5}>
                                                    <CFormInput
                                                        value={progressStep.label || ""}
                                                        onChange={(e) => onProgressStepChange(idx, "label", e.target.value)}
                                                        placeholder="Step Label"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={4}>
                                                    <CFormSelect
                                                        value={progressStep.status || "pending"}
                                                        onChange={(e) => onProgressStepChange(idx, "status", e.target.value)}
                                                        size="sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol md={2}>
                                                    <CFormInput
                                                        type="date"
                                                        value={progressStep.date || ""}
                                                        onChange={(e) => onProgressStepChange(idx, "date", e.target.value)}
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={1}>
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onRemoveProgressStep(idx)}
                                                    >
                                                        <CIcon icon={cilTrash} size="sm" />
                                                    </CButton>
                                                </CCol>
                                            </CRow>
                                        </div>
                                    ))}
                                    {(!step.progressSteps || step.progressSteps.length === 0) && (
                                        <div className="text-center text-muted py-3">
                                            No progress steps added. Click "Add Step" to add.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'statusTimeline' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 fw-semibold">Status Timeline</h6>
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        onClick={onAddStatusTimeline}
                                    >
                                        <CIcon icon={cilPlus} className="me-1" size="sm" />
                                        Add Event
                                    </CButton>
                                </div>
                                <div className="space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {(step.statusTimeline || []).map((event, idx) => (
                                        <div key={idx} className="p-3 bg-white rounded-3 border">
                                            <CRow className="g-2 align-items-center">
                                                <CCol md={3}>
                                                    <CFormInput
                                                        type="date"
                                                        value={event.date || ""}
                                                        onChange={(e) => onStatusTimelineChange(idx, "date", e.target.value)}
                                                        placeholder="Date"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={3}>
                                                    <CFormSelect
                                                        value={event.status || ""}
                                                        onChange={(e) => onStatusTimelineChange(idx, "status", e.target.value)}
                                                        size="sm"
                                                    >
                                                        <option value="">Select Status</option>
                                                        {statusOptions.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol md={5}>
                                                    <CFormInput
                                                        value={event.description || ""}
                                                        onChange={(e) => onStatusTimelineChange(idx, "description", e.target.value)}
                                                        placeholder="Description"
                                                        size="sm"
                                                    />
                                                </CCol>
                                                <CCol md={1}>
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onRemoveStatusTimeline(idx)}
                                                    >
                                                        <CIcon icon={cilTrash} size="sm" />
                                                    </CButton>
                                                </CCol>
                                            </CRow>
                                        </div>
                                    ))}
                                    {(!step.statusTimeline || step.statusTimeline.length === 0) && (
                                        <div className="text-center text-muted py-3">
                                            No timeline events added. Click "Add Event" to add.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preview Section */}
                        <div className="mt-4 pt-3 border-top">
                            <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                <CIcon icon={cilInfo} size="sm" />
                                Live Preview
                            </h6>
                            <CAlert color={getBannerTypeColor(step.banner?.type)} className="mb-3">
                                <div className="d-flex align-items-start gap-3">
                                    <div>
                                        <CIcon icon={cilCheckCircle} size="lg" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{step.banner?.title || "No banner title"}</h6>
                                        <p className="mb-0 small">{step.banner?.subtitle || "No banner subtitle"}</p>
                                        {step.banner?.fileUrl && (
                                            <a href={fileBaseurl(step.banner.fileUrl)} target="_blank" rel="noopener noreferrer" className="small">
                                                View Attached File
                                            </a>
                                        )}
                                    </div>
                                    {step.banner?.action && (
                                        <CButton color="primary" size="sm">
                                            {step.banner.action}
                                        </CButton>
                                    )}
                                </div>
                            </CAlert>
                            <div className="p-3 bg-white rounded-3 border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Current Status</small>
                                    <CBadge color={getStatusBadgeColor(step.page?.status)}>
                                        {step.page?.status || "Pending"}
                                    </CBadge>
                                </div>
                                {step.progress !== undefined && (
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Overall Progress</span>
                                            <span>{step.progress}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div 
                                                className="progress-bar bg-primary" 
                                                style={{ width: `${step.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {step.sections?.overview?.details && step.sections.overview.details.length > 0 && (
                                    <div className="mt-2">
                                        <small className="text-muted d-block mb-2">Key Information:</small>
                                        <div className="row g-2">
                                            {step.sections.overview.details.slice(0, 6).map((detail, idx) => (
                                                <div key={idx} className="col-6">
                                                    <div className="d-flex justify-content-between small">
                                                        <span className="text-muted">{detail.label}:</span>
                                                        <span className={detail.highlight ? "text-warning fw-semibold" : ""}>
                                                            {detail.value || "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {step.sections.overview.details.length > 6 && (
                                                <div className="col-12 text-center small text-muted">
                                                    +{step.sections.overview.details.length - 6} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(step.importantInfo && step.importantInfo.length > 0) && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-2">Important Information:</small>
                                        {step.importantInfo.slice(0, 2).map((info, idx) => (
                                            <div key={idx} className={`alert alert-${info.type || 'info'} p-2 mb-2 small`}>
                                                <strong>{info.title}:</strong> {info.description}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CCardBody>
                )}
            </CCard>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="bg-white rounded-3 p-4" style={{ width: '400px' }}>
                        <h6 className="mb-3">Delete Step</h6>
                        <p className="mb-4">Are you sure you want to delete "{step.label}"? This action cannot be undone.</p>
                        <div className="d-flex gap-2 justify-content-end">
                            <CButton color="secondary" variant="outline" onClick={handleCancelDelete}>
                                Cancel
                            </CButton>
                            <CButton color="danger" onClick={handleConfirmDelete}>
                                Delete Step
                            </CButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}