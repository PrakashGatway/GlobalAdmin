import React, { useState, useEffect } from 'react';
import {
    CForm,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CButton,
    CRow,
    CCol,
    CFormLabel,
    CAlert,
    CFormCheck,
    CInputGroup,
    CInputGroupText,
    CCard,
    CCardBody,
    CCardHeader,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDollar, cilCalendar, cilTag, cilPlus, cilTrash } from '@coreui/icons';
import apiService from '../../services/apiService';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CourseForm = ({ course, onSubmit, onCancel, error, submitting }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        university: '',
        category: '',
        subject: '',
        studyMode: '',
        shortName: '',
        tuitionFee: '',
        currency: 'USD',
        level: '',
        tags: [],
        applicationFee: '',
        duration: '',
        status: 'Active',
        description: '',
        requirements: [],
        docsRequired: [],
        scholarShip: '',
        seoData: {
            metaTitle: '',
            metaDescription: '',
            keywords: '',
            canonicalUrl: '',
        },
        isPublished: false,
        extraStatus: 'Active',
        sections: []
    });

    const [tagInput, setTagInput] = useState('');
    const [universities, setUniversities] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [newSection, setNewSection] = useState({
        section_key: '',
        heading: '',
        content: '',
        order: 0
    });

    const [extraContentMode, setExtraContentMode] = useState('new');
    // 'new' | 'existing'

    const [extraContents, setExtraContents] = useState([]);
    const [selectedExtraContent, setSelectedExtraContent] = useState('');


    const fetchExtraContents = async () => {
        try {
            const res = await apiService.get('/courses/content-list');
            if (res.success) {
                setExtraContents(res.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExtraContents();
    }, []);


    useEffect(() => {
        if (course) {
            const requirementsArray = [];
            if (course.requirements && typeof course.requirements === 'object') {
                Object.keys(course.requirements).forEach(key => {
                    requirementsArray.push({
                        key,
                        value: course.requirements[key]
                    });
                });
            }
            const docsArray = [];
            if (Array.isArray(course.docsRequired)) {
                course.docsRequired.forEach(doc => {
                    console.log(doc)
                    docsArray.push({ name: Object.keys(doc)[0], description: Object.values(doc)[0] });
                });
            } else if (typeof course.docsRequired === 'object') {
                Object.keys(course.docsRequired).forEach(key => {
                    docsArray.push({
                        name: key,
                        description: course.docsRequired[key]
                    });
                });
            }
            let sections = [];
            let isPublished = false;
            let extraStatus = 'Active';
            let seoData = {
                metaTitle: '',
                metaDescription: '',
                keywords: '',
                canonicalUrl: '',
            };
            if (course.extra_content) {
                if (course.extra_content.sections) {
                    sections = course.extra_content.sections;
                }
                if (course.extra_content.isPublished !== undefined) {
                    isPublished = course.extra_content.isPublished;
                }
                if (course.extra_content.status) {
                    extraStatus = course.extra_content.status;
                }
                if (course.extra_content.metaTitle) {
                    seoData.metaTitle = course.extra_content.metaTitle;
                }
                if (course.extra_content.metaDescription) {
                    seoData.metaDescription = course.extra_content.metaDescription;
                }
                if (course.extra_content.keywords) {
                    seoData.keywords = course.extra_content.keywords;
                }
                if (course.extra_content.canonicalUrl) {
                    seoData.canonicalUrl = course.extra_content.canonicalUrl;
                }
            }
            if (course.seoData) {
                seoData = {
                    ...seoData,
                    ...course.seoData
                };
            }
            const courseData = {
                ...course,
                university: course.university._id || '',
                category: course.category._id || '',
                subject: course.subject._id || '',
                tags: course.tags || [],
                tuitionFee: course.tuitionFee || '',
                applicationFee: course.applicationFee || '',
                requirements: requirementsArray,
                docsRequired: docsArray,
                sections: sections,
                isPublished: isPublished,
                extraStatus: extraStatus,
                seoData: seoData
            };
            setFormData(courseData);
        }
    }, [course]);

    useEffect(() => {
        fetchOptions();
    }, []);


    const fetchOptions = async () => {
        try {
            const [uniRes, catRes] = await Promise.all([
                apiService.get('/universities?limit=1000'),
                apiService.get('/courses/categories?limit=1000'),
            ]);

            if (uniRes.success) setUniversities(uniRes.data || uniRes.result || []);
            if (catRes.success) setCategories(catRes.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const fetchSubjects = async () => {
        if (!formData.category) {
            setSubjects([]);
            return;
        }

        try {
            const res = await apiService.get(`/subjects?category=${formData.category}&all=true`);
            if (res.success) {
                setSubjects(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        }
    };

    const fetchScholarships = async () => {
        try {
            const res = await apiService.get('/scholarships?limit=1000');
            if (res.success) setScholarships(res.data || []);
        } catch (error) {
            console.error('Error fetching scholarships:', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [formData.category]);

    useEffect(() => {
        fetchScholarships();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('seoData.')) {
            const seoField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                seoData: {
                    ...prev.seoData,
                    [seoField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Tag management
    const handleTagAdd = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTagAdd();
        }
    };

    // Requirements management
    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, { key: '', value: '' }]
        }));
    };

    const updateRequirement = (index, field, value) => {
        setFormData(prev => {
            const newRequirements = [...prev.requirements];
            newRequirements[index][field] = value;
            return { ...prev, requirements: newRequirements };
        });
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    // Documents management
    const addDocument = () => {
        setFormData(prev => ({
            ...prev,
            docsRequired: [...prev.docsRequired, { name: '', description: '' }]
        }));
    };

    const updateDocument = (index, field, value) => {
        setFormData(prev => {
            const newDocs = [...prev.docsRequired];
            newDocs[index][field] = value;
            return { ...prev, docsRequired: newDocs };
        });
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            docsRequired: prev.docsRequired.filter((_, i) => i !== index)
        }));
    };

    // Sections management
    const handleAddSection = () => {
        if (!newSection.section_key || !newSection.heading) return;

        const order = newSection.order || formData.sections.length + 1;
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { ...newSection, order }]
        }));
        setNewSection({ section_key: '', heading: '', content: '', order: 0 });
    };

    const handleUpdateSection = (index, field, value) => {
        setFormData(prev => {
            const updatedSections = [...prev.sections];
            updatedSections[index] = { ...updatedSections[index], [field]: value };
            return { ...prev, sections: updatedSections };
        });
    };

    const handleRemoveSection = (index) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert requirements array to object
        const requirementsObj = {};
        formData.requirements.forEach(req => {
            if (req.key && req.value) {
                requirementsObj[req.key] = req.value;
            }
        });

        // Convert documents array to array of strings or object
        const docsArray = formData.docsRequired
            .filter(doc => doc.name)
            .map(doc => doc.description ? { [doc.name]: doc.description } : doc.name);

        // Prepare the data for submission with the correct structure
        const submitData = {
            // Basic course data
            name: formData.name,
            slug: formData.slug,
            university: formData.university,
            category: formData.category,
            subject: formData.subject,
            studyMode: formData.studyMode,
            shortName: formData.shortName,
            tuitionFee: formData.tuitionFee ? Number(formData.tuitionFee) : 0,
            currency: formData.currency,
            level: formData.level,
            tags: formData.tags,
            applicationFee: formData.applicationFee ? Number(formData.applicationFee) : 0,
            duration: formData.duration,
            status: formData.status,
            description: formData.description,
            requirements: requirementsObj,
            docsRequired: docsArray,
            scholarShip: formData.scholarShip,

            // SEO data in separate object
            seoData: formData.seoData,

            // Extra content data
            extra_content: {
                sections: formData.sections,
                isPublished: formData.isPublished,
                status: formData.extraStatus,
            }
        };

        // Remove empty SEO fields
        Object.keys(submitData.seoData).forEach(key => {
            if (!submitData.seoData[key]) {
                delete submitData.seoData[key];
            }
        });

        // Remove empty extra_content fields
        Object.keys(submitData.extra_content).forEach(key => {
            if (submitData.extra_content[key] === undefined || submitData.extra_content[key] === null || submitData.extra_content[key] === '') {
                delete submitData.extra_content[key];
            }
        });

        onSubmit(submitData);
    };

    const levelOptions = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'Certificate', 'Other'];
    const studyModeOptions = ['Full-time', 'Part-time', 'Online', 'Hybrid'];
    const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BDT'];
    const statusOptions = ['Active', 'Inactive'];

    return (
        <CForm onSubmit={handleSubmit}>
            {error && (
                <CAlert color="danger" className="mb-3">
                    {error}
                </CAlert>
            )}

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Course Name*</CFormLabel>
                    <CFormInput
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Bachelor of Computer Science"
                        required
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Slug*</CFormLabel>
                    <CFormInput
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="e.g., bachelor-computer-science"
                        required
                    />
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={4}>
                    <CFormLabel>University*</CFormLabel>
                    <CFormSelect
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        required
                        disabled={loadingOptions}
                    >
                        <option value="">Select University</option>
                        {universities.map(uni => (
                            <option key={uni._id} value={uni._id}>
                                {uni.name}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormLabel>Category*</CFormLabel>
                    <CFormSelect
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={loadingOptions}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormLabel>Subject*</CFormLabel>
                    <CFormSelect
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={loadingOptions || !formData.category}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(sub => (
                            <option key={sub._id} value={sub._id}>
                                {sub.name}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={4}>
                    <CFormLabel>Level*</CFormLabel>
                    <CFormSelect
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Level</option>
                        {levelOptions.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormLabel>Study Mode*</CFormLabel>
                    <CFormSelect
                        name="studyMode"
                        value={formData.studyMode}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Study Mode</option>
                        {studyModeOptions.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormLabel>Duration*</CFormLabel>
                    <CFormInput
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 3 years, 4 semesters"
                        required
                    />
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Short Name</CFormLabel>
                    <CFormInput
                        name="shortName"
                        value={formData.shortName}
                        onChange={handleChange}
                        placeholder="e.g., BSc CS"
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Status</CFormLabel>
                    <CFormSelect
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Tuition Fee</CFormLabel>
                    <CInputGroup>
                        <CInputGroupText><CIcon icon={cilDollar} /></CInputGroupText>
                        <CFormInput
                            type="number"
                            className='py-0'
                            name="tuitionFee"
                            value={formData.tuitionFee}
                            onChange={handleChange}
                            placeholder="e.g., 15000"
                            min="0"
                        />
                        <CInputGroupText className='m-0 p-0'>
                            <CFormSelect
                                className='!p-0 m-0'
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                style={{ minWidth: '80px' }}
                            >
                                {currencyOptions.map(curr => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </CFormSelect>
                        </CInputGroupText>
                    </CInputGroup>
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Application Fee</CFormLabel>
                    <CInputGroup>
                        <CInputGroupText><CIcon icon={cilDollar} /></CInputGroupText>
                        <CFormInput
                            type="number"
                            name="applicationFee"
                            value={formData.applicationFee}
                            onChange={handleChange}
                            placeholder="e.g., 100"
                            min="0"
                        />
                    </CInputGroup>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Tags</CFormLabel>
                    <CInputGroup>
                        <CInputGroupText><CIcon icon={cilTag} /></CInputGroupText>
                        <CFormInput
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            placeholder="Add tags (press Enter)"
                        />
                        <CButton type="button" color="primary" onClick={handleTagAdd}>
                            <CIcon icon={cilPlus} />
                        </CButton>
                    </CInputGroup>
                    <div className="mt-2 d-flex flex-wrap gap-1">
                        {formData.tags.map((tag, index) => (
                            <div key={index} className="d-flex align-items-center bg-info-subtle px-2 py-1 rounded">
                                <span className="me-1">{tag}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm p-0"
                                    onClick={() => handleTagRemove(tag)}
                                    style={{ lineHeight: 1 }}
                                >
                                    <CIcon icon={cilTrash} className="text-danger" />
                                </button>
                            </div>
                        ))}
                    </div>
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Scholarship</CFormLabel>
                    <CFormSelect
                        name="scholarShip"
                        value={formData.scholarShip}
                        onChange={handleChange}
                        disabled={loadingOptions}
                    >
                        <option value="">No Scholarship</option>
                        {scholarships.map(sch => (
                            <option key={sch._id} value={sch._id}>
                                {sch.name}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormLabel>Description</CFormLabel>
                    <CFormTextarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Course description..."
                    />
                </CCol>
            </CRow>

            {/* Requirements Section */}
            <CRow className="mb-3">
                <CCol md={12}>
                    <CCard>
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <CFormLabel className="mb-0 fw-bold">Eligibility Requirements</CFormLabel>
                                <CButton type="button" color="primary" size="sm" onClick={addRequirement}>
                                    <CIcon icon={cilPlus} className="me-1" /> Add Requirement
                                </CButton>
                            </div>

                            {formData.requirements.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    No requirements added. Click "Add Requirement" to add one.
                                </div>
                            ) : (
                                <div className="">
                                    <table className="table table-sm border-none">
                                        <thead>
                                            <tr>
                                                <th width="40%">Requirement Name</th>
                                                <th width="50%">Value/Description</th>
                                                <th width="10%">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.requirements.map((req, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <CFormInput
                                                            placeholder="e.g., IELTS Score, GPA, Minimum Age"
                                                            value={req.key}
                                                            onChange={(e) => updateRequirement(index, 'key', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <CFormInput
                                                            placeholder="e.g., 6.5, 3.0, 18 years"
                                                            value={req.value}
                                                            onChange={(e) => updateRequirement(index, 'value', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <CButton
                                                            type="button"
                                                            color="danger"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeRequirement(index)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <small className="text-muted">
                                Examples: IELTS Score: 6.5, GPA: 3.0, Minimum Age: 18, Work Experience: 2 years
                            </small>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Documents Required Section */}
            <CRow className="mb-3">
                <CCol md={12}>
                    <CCard>
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <CFormLabel className="mb-0 fw-bold">Documents Required</CFormLabel>
                                <CButton type="button" color="primary" size="sm" onClick={addDocument}>
                                    <CIcon icon={cilPlus} className="me-1" /> Add Document
                                </CButton>
                            </div>

                            {formData.docsRequired.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    No documents required. Click "Add Document" to add one.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th width="40%">Document Name</th>
                                                <th width="50%">Description (Optional)</th>
                                                <th width="10%">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.docsRequired.map((doc, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <CFormInput
                                                            placeholder="e.g., Transcript, Passport, CV"
                                                            value={doc.name}
                                                            onChange={(e) => updateDocument(index, 'name', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <CFormInput
                                                            placeholder="e.g., Certified copy, Notarized, Original"
                                                            value={doc.description}
                                                            onChange={(e) => updateDocument(index, 'description', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <CButton
                                                            type="button"
                                                            color="danger"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeDocument(index)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <small className="text-muted">
                                Examples: Transcript, Passport Copy, Recommendation Letters, CV/Resume
                            </small>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <hr className="my-4" />
            <h5>SEO Data</h5>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Meta Title</CFormLabel>
                    <CFormInput
                        name="seoData.metaTitle"
                        value={formData.seoData?.metaTitle || ''}
                        onChange={handleChange}
                        placeholder="SEO title"
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Canonical URL</CFormLabel>
                    <CFormInput
                        name="seoData.canonicalUrl"
                        value={formData.seoData?.canonicalUrl || ''}
                        onChange={handleChange}
                        placeholder="https://example.com/course-name"
                    />
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Meta Description</CFormLabel>
                    <CFormTextarea
                        name="seoData.metaDescription"
                        value={formData.seoData?.metaDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        placeholder="SEO description"
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Meta Keywords</CFormLabel>
                    <CFormTextarea
                        name="seoData.keywords"
                        value={formData.seoData?.keywords || ''}
                        onChange={handleChange}
                        rows={2}
                        placeholder="SEO keywords (comma separated)"
                    />
                </CCol>
            </CRow>

            {/* <CCard className="mb-4">
                <CCardBody>
                    <CFormLabel className="fw-bold">Extra Content Type</CFormLabel>

                    <CFormSelect
                        value={extraContentMode}
                        onChange={(e) => setExtraContentMode(e.target.value)}
                    >
                        <option value="new">Create New Extra Content</option>
                        <option value="existing">Use Existing Extra Content</option>
                    </CFormSelect>
                </CCardBody>
            </CCard> */}

            {/* {extraContentMode === 'existing' && (
                <CCard className="mb-4">
                    <CCardBody>
                        <CFormLabel>Select Extra Content</CFormLabel>
                        <CFormSelect
                            value={selectedExtraContent}
                            onChange={(e) => setSelectedExtraContent(e.target.value)}
                            required
                        >
                            <option value="">Select Extra Content</option>
                            {extraContents.map((ec, index) => (
                                <option key={index} value={ec.extraContent?._id}>
                                    {ec.courseName || `Extra Content (${ec.extraContent?._id})`}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCardBody>
                </CCard>
            )} */}


            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Extra Content Sections</h5>
                </CCardHeader>
                <CCardBody>
                    {/* Add New Section */}
                    <CRow className="g-3 mb-4">
                        <CCol md={3}>
                            <CFormLabel>Section Key</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="Section key"
                                value={newSection.section_key}
                                onChange={(e) => setNewSection(prev => ({ ...prev, section_key: e.target.value }))}
                            />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel>Heading</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="Section heading"
                                value={newSection.heading}
                                onChange={(e) => setNewSection(prev => ({ ...prev, heading: e.target.value }))}
                            />
                        </CCol>
                        <CCol md={3}>
                            <CFormLabel>Order</CFormLabel>
                            <CFormInput
                                type="number"
                                min="0"
                                placeholder="Display order"
                                value={newSection.order || formData.sections.length + 1}
                                onChange={(e) => setNewSection(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                            />
                        </CCol>
                        <CCol md={2} className="d-flex align-items-end">
                            <CButton color="primary" onClick={handleAddSection} disabled={!newSection.section_key || !newSection.heading}>
                                <FaPlus /> Add
                            </CButton>
                        </CCol>
                    </CRow>

                    {/* Existing Sections */}
                    {formData.sections?.map((section, index) => (
                        <CCard key={index} className="mb-3">
                            <CCardBody>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6>{section.heading}</h6>
                                        <small className="text-muted">Key: {section.section_key} | Order: {section.order}</small>
                                    </div>
                                    <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => handleRemoveSection(index)}
                                    >
                                        <FaTrash />
                                    </CButton>
                                </div>

                                <div className="mb-3">
                                    <CFormLabel>Section Heading</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        value={section.heading}
                                        onChange={(e) => handleUpdateSection(index, 'heading', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <CFormLabel>Content (HTML)</CFormLabel>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={section.content}
                                        config={{
                                            simpleUpload: {
                                                uploadUrl: 'http://localhost:5000/api/upload'
                                            }
                                        }}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            handleUpdateSection(index, 'content', data);
                                        }}
                                    />
                                </div>
                            </CCardBody>
                        </CCard>
                    ))}

                    {/* Extra Content Settings */}
                    <CRow className="g-3 mt-3">
                        <CCol md={6}>
                            <CFormCheck
                                name="isPublished"
                                label="Published"
                                checked={formData.isPublished}
                                onChange={handleCheckboxChange}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Extra Content Status</CFormLabel>
                            <CFormSelect
                                name="extraStatus"
                                value={formData.extraStatus}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton color="secondary" onClick={onCancel} disabled={submitting}>
                    Cancel
                </CButton>
                <CButton type="submit" color="primary" disabled={submitting}>
                    {submitting ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
                </CButton>
            </div>
        </CForm>
    );
};

export default CourseForm;