import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    CForm,
    CFormLabel,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CButton,
    CRow,
    CCol,
    CFormCheck,
    CAlert,
    CInputGroup,
    CInputGroupText,
    CCard,
    CCardBody,
    CAccordion,
    CAccordionItem,
    CAccordionHeader,
    CAccordionBody,
    CBadge,
    CTooltip,
    CProgress,
} from '@coreui/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
    cilWarning,
    cilPlus,
    cilTrash,
    cilChevronBottom,
    cilChevronTop,
    cilCheckCircle,
    cilInfo,
    cilPencil,
    cilSave,
    cilX
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

/* ---------- Enhanced Key Value Editor ---------- */
const KeyValueEditor = ({
    label,
    value = {},
    onChange,
    keyPlaceholder = "Key",
    valuePlaceholder = "Value",
    addButtonText = "Add",
    description = "",
    allowTextarea = false,
    maxRows = 10
}) => {
    const [rows, setRows] = useState([]);
    const [expanded, setExpanded] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);

    const initializedRef = useRef(false);
    const lastValueRef = useRef(null);

    useEffect(() => {
        // Convert object to stable signature
        const signature = JSON.stringify(value || {});

        // If already initialized with same data, do nothing
        if (initializedRef.current && lastValueRef.current === signature) {
            return;
        }

        const entries = Object.entries(value || {});
        const initialRows = entries.length
            ? entries.map(([key, val]) => ({
                id: crypto.randomUUID(),
                key,
                value: val,
            }))
            : [{ id: crypto.randomUUID(), key: '', value: '' }];

        setRows(initialRows);

        initializedRef.current = true;
        lastValueRef.current = signature;
    }, [value]);



    const updateRow = (id, field, val) => {
        const updated = rows.map(row =>
            row.id === id ? { ...row, [field]: val } : row
        );
        setRows(updated);

        const obj = {};
        updated.forEach(row => {
            if (row.key && row.value !== undefined && row.value !== '') {
                obj[row.key] = row.value;
            }
        });
        onChange(obj);
    };

    const addRow = () => {
        const newRow = {
            id: Math.random().toString(36).substr(2, 9),
            key: '',
            value: ''
        };
        setRows([...rows, newRow]);
        setEditingIndex(rows.length);
    };

    const removeRow = (id) => {
        if (rows.length <= 1) {
            const clearedRow = { id, key: '', value: '' };
            setRows([clearedRow]);
            onChange({});
        } else {
            const updated = rows.filter(row => row.id !== id);
            setRows(updated);

            const obj = {};
            updated.forEach(row => {
                if (row.key && row.value !== undefined && row.value !== '') {
                    obj[row.key] = row.value;
                }
            });
            onChange(obj);
        }
    };

    const handleKeyDown = (e, id, field) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const currentIndex = rows.findIndex(row => row.id === id);
            const nextField = field === 'key' ? 'value' : 'key';
            const nextId = field === 'value' && currentIndex < rows.length - 1
                ? rows[currentIndex + 1]?.id
                : id;

            if (nextId) {
                const element = document.querySelector(`[data-row-id="${nextId}"][data-field="${nextField}"]`);
                element?.focus();
            }
        }
    };

    const isEmpty = rows.every(row => !row.key.trim() && !row.value.trim());
    const completionPercentage = rows.length === 0 ? 0 :
        Math.round((rows.filter(row => row.key.trim() && row.value.trim()).length / rows.length) * 100);

    return (
        <CCard className="mb-3 border shadow-sm">
            <CCardBody className="p-0">
                <CAccordion activeItemKey={expanded ? 1 : 0}>
                    <CAccordionItem itemKey={1}>
                        <CAccordionHeader
                            onClick={() => setExpanded(!expanded)}
                            className="bg-light"
                        >
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <div className="d-flex align-items-center gap-2">
                                    <div>
                                        <strong>{label}</strong>
                                        {description && (
                                            <small className="text-muted d-block">{description}</small>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    {!isEmpty && (
                                        <>
                                            <CProgress
                                                className="w-100"
                                                style={{ width: '60px', height: '6px' }}
                                                value={completionPercentage}
                                                color={completionPercentage === 100 ? 'success' : 'info'}
                                            />
                                            <small className="text-muted">{completionPercentage}%</small>
                                        </>
                                    )}
                                    <CBadge color={isEmpty ? 'secondary' : 'success'} className="ms-2">
                                        {rows.filter(r => r.key && r.value).length} items
                                    </CBadge>
                                </div>
                            </div>
                        </CAccordionHeader>
                        <CAccordionBody className="p-3">
                            <div className="">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th width="40%" className="fw-semibold">Key</th>
                                            <th width="50%" className="fw-semibold">Value</th>
                                            <th width="10%" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, index) => (
                                            <tr key={row.id} className={editingIndex === index ? 'table-info' : ''}>
                                                <td>
                                                    <CFormInput
                                                        data-row-id={row.id}
                                                        data-field="key"
                                                        placeholder={keyPlaceholder}
                                                        value={row.key}
                                                        onChange={(e) => updateRow(row.id, 'key', e.target.value)}
                                                        onFocus={() => setEditingIndex(index)}
                                                        onBlur={() => setEditingIndex(null)}
                                                        onKeyDown={(e) => handleKeyDown(e, row.id, 'key')}
                                                        size="sm"
                                                        className="border-0 shadow-none"
                                                    />
                                                </td>
                                                <td>
                                                    {allowTextarea && (row.value?.length > 50 || row.key.includes('description')) ? (
                                                        <CFormTextarea
                                                            data-row-id={row.id}
                                                            data-field="value"
                                                            placeholder={valuePlaceholder}
                                                            value={row.value}
                                                            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                                                            onFocus={() => setEditingIndex(index)}
                                                            onBlur={() => setEditingIndex(null)}
                                                            onKeyDown={(e) => handleKeyDown(e, row.id, 'value')}
                                                            rows={Math.min(Math.ceil(row.value.length / 50), 3)}
                                                            size="sm"
                                                            className="border-0 shadow-none"
                                                        />
                                                    ) : (
                                                        <CFormInput
                                                            data-row-id={row.id}
                                                            data-field="value"
                                                            placeholder={valuePlaceholder}
                                                            value={row.value}
                                                            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                                                            onFocus={() => setEditingIndex(index)}
                                                            onBlur={() => setEditingIndex(null)}
                                                            onKeyDown={(e) => handleKeyDown(e, row.id, 'value')}
                                                            size="sm"
                                                            className="border-0 shadow-none"
                                                        />
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <CTooltip content="Delete row">
                                                        <CButton
                                                            color="danger"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => removeRow(row.id)}
                                                            className="py-0 px-2"
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <div>
                                    {rows.filter(r => r.key && r.value).length === 0 ? (
                                        <small className="text-muted">
                                            <CIcon icon={cilInfo} className="me-1" />
                                            Add your first item to get started
                                        </small>
                                    ) : (
                                        <small className="text-success">
                                            <CIcon icon={cilCheckCircle} className="me-1" />
                                            {rows.filter(r => r.key && r.value).length} valid items
                                        </small>
                                    )}
                                </div>
                                <div className="d-flex gap-2">
                                    {rows.length > 1 && (
                                        <CButton
                                            size="sm"
                                            color="warning"
                                            variant="outline"
                                            onClick={() => {
                                                const cleared = { id: Math.random().toString(36).substr(2, 9), key: '', value: '' };
                                                setRows([cleared]);
                                                onChange({});
                                            }}
                                        >
                                            Clear All
                                        </CButton>
                                    )}
                                    <CButton
                                        size="sm"
                                        color="primary"
                                        onClick={addRow}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        <CIcon icon={cilPlus} />
                                        {addButtonText}
                                    </CButton>
                                </div>
                            </div>

                            {rows.length > maxRows && (
                                <CAlert color="warning" className="mt-2 p-2">
                                    <small>
                                        <CIcon icon={cilWarning} className="me-1" />
                                        You have {rows.length} items. Consider breaking this into smaller sections.
                                    </small>
                                </CAlert>
                            )}
                        </CAccordionBody>
                    </CAccordionItem>
                </CAccordion>
            </CCardBody>
        </CCard>
    );
};

/* ---------- Multi-Select with React Select ---------- */
export const CustomMultiSelect = ({
    label,
    options = [],
    value = [],
    onChange,
    placeholder = "Select items...",
    isCreatable = false,
    isLoading = false,
    error,
    required = false
}) => {
    const SelectComponent = isCreatable ? CreatableSelect : Select;

    const selectValue = useMemo(() => {
        return value?.map(id => {
            const option = options.find(opt => opt._id === id);
            return option ? {
                value: option._id,
                label: option.name || option.label || option.value
            } : null;
        }).filter(Boolean);
    }, [value, options]);

    const selectOptions = useMemo(() => {
        return options.map(option => ({
            value: option._id,
            label: option.name || option.label || option.value,
            ...option
        }));
    }, [options]);

    const handleChange = (selectedOptions) => {
        const newValue = selectedOptions ? selectedOptions.map(option => option.value) : [];
        onChange(newValue);
    };

    const customStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: error ? '#e55353' : state.isFocused ? '#321fdb' : '#d8dbe0',
            borderRadius: '0.375rem',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(50, 31, 219, 0.25)' : 'none',
            '&:hover': {
                borderColor: error ? '#e55353' : '#8a93a2'
            },
            minHeight: '38px',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#321fdb',
            borderRadius: '4px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'white',
            fontWeight: '500',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'white',
            ':hover': {
                backgroundColor: '#2415a3',
                color: 'white',
            },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#321fdb' : state.isFocused ? '#e4e6ef' : 'white',
            color: state.isSelected ? 'white' : '#3c4b64',
            ':active': {
                backgroundColor: '#321fdb',
                color: 'white',
            },
        }),
    };

    return (
        <div className="mb-3">
            <CFormLabel className="fw-semibold">
                {label} {required && <span className="text-danger">*</span>}
            </CFormLabel>
            <SelectComponent
                isMulti
                value={selectValue}
                onChange={handleChange}
                options={selectOptions}
                placeholder={placeholder}
                isLoading={isLoading}
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                menuPlacement="auto"
                menuPosition="fixed"
                isClearable={true}
                noOptionsMessage={() => "No options found"}
                loadingMessage={() => "Loading..."}
                formatOptionLabel={(option, { context }) => (
                    <div className="d-flex align-items-center">
                        <div>
                            <div>{option.label}</div>
                        </div>
                    </div>
                )}
            />
            {error && <div className="text-danger small mt-1">{error}</div>}
            {selectValue.length > 0 && (
                <div className="d-flex align-items-center gap-1 mt-2">
                    <small className="text-muted">
                        <CIcon icon={cilCheckCircle} className="text-success me-1" />
                        {selectValue.length} item{selectValue.length !== 1 ? 's' : ''} selected
                    </small>
                </div>
            )}
        </div>
    );
};


const ScholarshipForm = ({
    scholarship,
    onSubmit,
    onCancel,
    error,
    submitting,
    countries,
    universities,
    subjects,
}) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        subjects: [],
        country: '',
        university: '',
        level: [],
        fundingType: '',
        studyMode: '',
        deliveryMode: '',
        amount: '',
        valueDetails: {},
        eligibilityCriteria: {},
        benefits: {},
        exclusionCriteria: {},
        selectionBasis: '',
        deadline: '',
        intake: '',
        isPublished: true,
        status: 'Active',
        howToApply: {},
        metaData: {},
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (scholarship) {
            // Handle both new structure and old structure
            const subjectsArray = scholarship.subjects || [];
            setFormData({
                title: scholarship.title || '',
                slug: scholarship.slug || '',
                description: scholarship.description || '',
                subjects: subjectsArray.map(s => s._id || s),
                country: scholarship.country?._id || scholarship.country || '',
                university: scholarship.university?._id || scholarship.university || '',
                level: Array.isArray(scholarship.level) ? scholarship.level : [scholarship.level].filter(Boolean),
                fundingType: scholarship.fundingType || '',
                studyMode: scholarship.studyMode || '',
                deliveryMode: scholarship.deliveryMode || '',
                amount: scholarship.amount || '',
                valueDetails: scholarship.valueDetails || {},
                eligibilityCriteria: scholarship.eligibilityCriteria || {},
                benefits: scholarship.benefits || {},
                exclusionCriteria: scholarship.exclusionCriteria || {},
                selectionBasis: scholarship.selectionBasis || '',
                deadline: scholarship.deadline || '',
                intake: scholarship.intake || '',
                isPublished: scholarship.isPublished !== undefined ? scholarship.isPublished : true,
                status: scholarship.status || 'Active',
                howToApply: scholarship.howToApply || {},
                metaData: scholarship.metaData || {},
            });
        }
    }, [scholarship]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!scholarship && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, scholarship]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubjectsChange = (selectedSubjects) => {
        setFormData(prev => ({ ...prev, subjects: selectedSubjects }));
        if (formErrors.subjects) {
            setFormErrors(prev => ({ ...prev, subjects: '' }));
        }
    };

    const handleLevelChange = (level) => {
        setFormData(prev => ({
            ...prev,
            level: prev.level.includes(level)
                ? prev.level.filter(l => l !== level)
                : [...prev.level, level],
        }));
        if (formErrors.level) {
            setFormErrors(prev => ({ ...prev, level: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        if (formData.subjects.length === 0) errors.subjects = 'At least one subject is required';
        if (!formData.country) errors.country = 'Country is required';
        if (!formData.university) errors.university = 'University is required';
        if (formData.level.length === 0) errors.level = 'At least one level is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const cleanedData = { ...formData };
        ['valueDetails', 'eligibilityCriteria', 'benefits', 'exclusionCriteria', 'howToApply', 'metaData'].forEach(field => {
            if (Object.keys(cleanedData[field]).length === 0) {
                delete cleanedData[field];
            }
        });

        onSubmit(cleanedData);
    };

    const levelOptions = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'Certificate'];
    const fundingTypeOptions = ['Fee waiver/discount', 'Stipend', 'Loan', 'Full tuition', 'Partial tuition'];
    const studyModeOptions = ['Full-time', 'Part-time', 'Online', 'Hybrid'];
    const deliveryModeOptions = ['Online', 'Offline', 'Blended'];
    const statusOptions = ['Active', 'Inactive'];

    // Calculate completion percentage
    const formCompletion = () => {
        const requiredFields = [
            formData.title,
            formData.slug,
            formData.country,
            formData.university,
            formData.subjects.length > 0,
            formData.level.length > 0,
        ];
        return Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);
    };

    return (
        <CForm onSubmit={handleSubmit} style={{ maxWidth: "90vw", margin: 'auto' }}>
            {error && (
                <CAlert color="danger" className="mb-4 d-flex align-items-center">
                    <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
                    <div>{error}</div>
                </CAlert>
            )}

            {/* Form Progress */}
            <CCard className="mb-4 bg-light">
                <CCardBody className="py-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-muted">Form Completion</small>
                            <div className="fw-semibold">{formCompletion()}% Complete</div>
                        </div>
                        <CProgress
                            className="w-50"
                            value={formCompletion()}
                            color={formCompletion() === 100 ? 'success' : 'primary'}
                            style={{ height: '8px' }}
                        />
                    </div>
                </CCardBody>
            </CCard>

            <CRow className="g-3 mb-4">
                <CCol md={8}>
                    <CFormLabel className="fw-semibold">
                        Title <span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup>
                        <CInputGroupText>
                            <CIcon icon={cilPencil} />
                        </CInputGroupText>
                        <CFormInput
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., International Excellence Scholarship"
                            invalid={!!formErrors.title}
                            required
                        />
                    </CInputGroup>
                    {formErrors.title && <div className="invalid-feedback d-block">{formErrors.title}</div>}
                </CCol>

                <CCol md={4}>
                    <CFormLabel className="fw-semibold">
                        Slug <span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup>
                        <CInputGroupText>/scholarships/</CInputGroupText>
                        <CFormInput
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="international-excellence-scholarship"
                            invalid={!!formErrors.slug}
                            required
                        />
                    </CInputGroup>
                    {formErrors.slug && <div className="invalid-feedback d-block">{formErrors.slug}</div>}
                </CCol>

                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Description</CFormLabel>
                    <CFormTextarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Provide a comprehensive description of the scholarship including overview, objectives, and key highlights..."
                    />
                </CCol>
            </CRow>

            <CRow className="g-3 mb-4">
                <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                        Country <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        invalid={!!formErrors.country}
                        required
                    >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country._id} value={country._id}>
                                {country.name}
                            </option>
                        ))}
                    </CFormSelect>
                    {formErrors.country && <div className="invalid-feedback d-block">{formErrors.country}</div>}
                </CCol>

                <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                        University <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        invalid={!!formErrors.university}
                        required
                    >
                        <option value="">Select University</option>
                        {universities.map((uni) => (
                            <option key={uni._id} value={uni._id}>
                                {uni.name}
                            </option>
                        ))}
                    </CFormSelect>
                    {formErrors.university && <div className="invalid-feedback d-block">{formErrors.university}</div>}
                </CCol>
            </CRow>

            {/* Subjects - React Select Multi-select */}
            <div className="mb-4">
                <CustomMultiSelect
                    label="Subjects"
                    options={subjects}
                    value={formData.subjects}
                    onChange={handleSubjectsChange}
                    placeholder="Search and select subjects..."
                    error={formErrors.subjects}
                    required
                />
            </div>

            {/* Levels */}
            <div className="mb-4">
                <CFormLabel className="fw-semibold">
                    Levels <span className="text-danger">*</span>
                </CFormLabel>
                <CCard className="border">
                    <CCardBody className="py-2">
                        <CRow>
                            {levelOptions.map((level) => (
                                <CCol md={4} key={level} className="mb-2">
                                    <CFormCheck
                                        id={`level-${level}`}
                                        label={level}
                                        checked={formData.level.includes(level)}
                                        onChange={() => handleLevelChange(level)}
                                        className="fw-normal"
                                    />
                                </CCol>
                            ))}
                        </CRow>
                    </CCardBody>
                </CCard>
                {formErrors.level && <div className="text-danger small mt-1">{formErrors.level}</div>}
            </div>

            <CRow className="g-3 mb-4">
                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Funding Type</CFormLabel>
                    <CFormSelect
                        name="fundingType"
                        value={formData.fundingType}
                        onChange={handleChange}
                    >
                        <option value="">Select Type</option>
                        {fundingTypeOptions.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </CFormSelect>
                </CCol>

                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Amount/Value</CFormLabel>
                    <CInputGroup>
                        <CInputGroupText>
                            <CIcon icon={cilSave} />
                        </CInputGroupText>
                        <CFormInput
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="e.g., 25%, $5000, Full tuition"
                        />
                    </CInputGroup>
                </CCol>

                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Study Mode</CFormLabel>
                    <CFormSelect
                        name="studyMode"
                        value={formData.studyMode}
                        onChange={handleChange}
                    >
                        <option value="">Select Mode</option>
                        {studyModeOptions.map((mode) => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="g-3 mb-4">
                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Delivery Mode</CFormLabel>
                    <CFormSelect
                        name="deliveryMode"
                        value={formData.deliveryMode}
                        onChange={handleChange}
                    >
                        <option value="">Select Mode</option>
                        {deliveryModeOptions.map((mode) => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </CFormSelect>
                </CCol>

                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Selection Basis</CFormLabel>
                    <CFormInput
                        name="selectionBasis"
                        value={formData.selectionBasis}
                        onChange={handleChange}
                        placeholder="e.g., Academic excellence, Merit-based"
                    />
                </CCol>

                <CCol md={4}>
                    <CFormLabel className="fw-semibold">Status</CFormLabel>
                    <CFormSelect
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="g-3 mb-4">
                <CCol md={6}>
                    <CFormLabel className="fw-semibold">Application Deadline</CFormLabel>
                    <CFormInput
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                </CCol>

                <CCol md={6}>
                    <CFormLabel className="fw-semibold">Intake</CFormLabel>
                    <CFormInput
                        name="intake"
                        value={formData.intake}
                        onChange={handleChange}
                        placeholder="e.g., Fall 2024, Spring 2025"
                    />
                </CCol>
            </CRow>

            {/* Enhanced Key-Value Editors */}
            <div className="mb-4">
                <KeyValueEditor
                    label="Value Details"
                    value={formData.valueDetails}
                    onChange={(value) => setFormData(prev => ({ ...prev, valueDetails: value }))}
                    keyPlaceholder="Detail (e.g., Tuition Coverage)"
                    valuePlaceholder="Value (e.g., 100%)"
                    addButtonText="Add Detail"
                    description="Specific financial or academic benefits"
                />

                <KeyValueEditor
                    label="Eligibility Criteria"
                    value={formData.eligibilityCriteria}
                    onChange={(value) => setFormData(prev => ({ ...prev, eligibilityCriteria: value }))}
                    keyPlaceholder="Criterion (e.g., GPA Requirement)"
                    valuePlaceholder="Description (e.g., Minimum 3.5 GPA)"
                    addButtonText="Add Criterion"
                    description="Requirements applicants must meet"
                    allowTextarea={true}
                />

                <KeyValueEditor
                    label="Benefits"
                    value={formData.benefits}
                    onChange={(value) => setFormData(prev => ({ ...prev, benefits: value }))}
                    keyPlaceholder="Benefit (e.g., Housing Allowance)"
                    valuePlaceholder="Details (e.g., $1000/month)"
                    addButtonText="Add Benefit"
                    description="Additional perks and advantages"
                    allowTextarea={true}
                />

                {/* <KeyValueEditor
          label="Exclusion Criteria"
          value={formData.exclusionCriteria}
          onChange={(value) => setFormData(prev => ({ ...prev, exclusionCriteria: value }))}
          keyPlaceholder="Exclusion (e.g., International Students)"
          valuePlaceholder="Reason (e.g., Not eligible)"
          addButtonText="Add Exclusion"
          description="Who cannot apply"
        /> */}

                <KeyValueEditor
                    label="How to Apply"
                    value={formData.howToApply}
                    onChange={(value) => setFormData(prev => ({ ...prev, howToApply: value }))}
                    keyPlaceholder="Step (e.g., Submit Documents)"
                    valuePlaceholder="Instructions (e.g., Upload transcripts...)"
                    addButtonText="Add Step"
                    description="Step-by-step application process"
                    allowTextarea={true}
                />
                {/* 
        <KeyValueEditor
          label="Metadata"
          value={formData.metaData}
          onChange={(value) => setFormData(prev => ({ ...prev, metaData: value }))}
          keyPlaceholder="Key (e.g., seo_keywords)"
          valuePlaceholder="Value (e.g., scholarship, funding, study)"
          addButtonText="Add Metadata"
          description="Additional data for SEO and organization"
        /> */}
            </div>

            {/* Publish Status */}
            <CCard className="mb-4">
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <div className="form-check form-switch">
                                <CFormCheck
                                    label="Published"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        isPublished: e.target.checked
                                    }))}
                                />
                            </div>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div>
                    <small className="text-muted">
                        Fields marked with <span className="text-danger">*</span> are required
                    </small>
                </div>
                <div className="d-flex gap-2">
                    <CButton
                        color="secondary"
                        onClick={onCancel}
                        disabled={submitting}
                        variant="outline"
                        className="d-flex align-items-center gap-1"
                    >
                        <CIcon icon={cilX} />
                        Cancel
                    </CButton>
                    <CButton
                        type="submit"
                        color="primary"
                        disabled={submitting}
                        className="d-flex align-items-center gap-1"
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : scholarship ? (
                            <>
                                <CIcon icon={cilSave} />
                                Update Scholarship
                            </>
                        ) : (
                            <>
                                <CIcon icon={cilCheckCircle} />
                                Create Scholarship
                            </>
                        )}
                    </CButton>
                </div>
            </div>
        </CForm>
    );
};

export default ScholarshipForm;