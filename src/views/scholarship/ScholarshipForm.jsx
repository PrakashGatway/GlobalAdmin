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
    CCardHeader,
    CSpinner,
} from '@coreui/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import CKEditorComponent from '../page-information/Ckeditor';
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
    cilX,
    cilArrowTop,
    cilArrowBottom,
    cilFolder,
    cilList,
    cilStar,
    cilFile
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import uploadService from '../../services/uploadService';

/* ---------- Enhanced Key Value Editor (AUTO-REMOVE FIXED) ---------- */
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
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // 1. Initialize state safely only once on mount
    const [rows, setRows] = useState(() => {
        if (value && typeof value === 'object' && Object.keys(value).length > 0) {
            return Object.entries(value).map(([key, val]) => ({
                id: `init-${key}-${generateId()}`,
                key,
                value: val,
            }));
        }
        return [{ id: generateId(), key: '', value: '' }];
    });

    const [expanded, setExpanded] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);

    // 2. SMART SYNC: Only overwrite local state if parent has *new complete* data.
    // We specifically AVOID overwriting if parent has LESS valid data, 
    // because that means the user is currently typing an incomplete row.
    useEffect(() => {
        if (!value || typeof value !== 'object') return;

        const entries = Object.entries(value);
        const parentValidCount = entries.filter(([k, v]) => k.trim() !== '' && v !== '').length;
        const localValidCount = rows.filter(r => r.key.trim() !== '' && r.value !== '').length;

        if (parentValidCount > 0 && parentValidCount !== localValidCount) {
            // Parent has new valid data (e.g., initial load or switching scholarships)
            setRows(prevRows => {
                return entries.map(([key, val]) => {
                    const existing = prevRows.find(r => r.key === key);
                    return {
                        id: existing ? existing.id : generateId(), // Preserve ID to prevent focus loss
                        key,
                        value: val,
                    };
                });
            });
        } else if (parentValidCount === 0 && localValidCount === 0 && rows.length === 0) {
            // Edge case: ensure at least one empty row exists if everything is cleared
            setRows([{ id: generateId(), key: '', value: '' }]);
        }
    }, [value]);

    const updateRow = (id, field, val) => {
        const updated = rows.map(row =>
            row.id === id ? { ...row, [field]: val } : row
        );
        setRows(updated);

        // Build the object to send to parent, ignoring completely empty rows
        const obj = {};
        updated.forEach(row => {
            if (row.key && row.key.trim() !== '' && row.value !== undefined && row.value !== '') {
                obj[row.key.trim()] = row.value;
            }
        });
        onChange(obj);
    };

    const addRow = () => {
        const newRow = {
            id: generateId(),
            key: '',
            value: ''
        };
        setRows(prev => [...prev, newRow]);
        setEditingIndex(rows.length);
    };

    const removeRow = (id) => {
        if (rows.length <= 1) {
            const clearedRow = { id: generateId(), key: '', value: '' };
            setRows([clearedRow]);
            onChange({});
        } else {
            const updated = rows.filter(row => row.id !== id);
            setRows(updated);

            const obj = {};
            updated.forEach(row => {
                if (row.key && row.key.trim() !== '' && row.value !== undefined && row.value !== '') {
                    obj[row.key.trim()] = row.value;
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
                setTimeout(() => {
                    const element = document.querySelector(`[data-row-id="${nextId}"][data-field="${nextField}"]`);
                    element?.focus();
                }, 10);
            }
        }
    };

    const isEmpty = rows.every(row => !row.key.trim() && !row.value.trim());
    const validItems = rows.filter(r => r.key.trim() && r.value.trim()).length;
    const completionPercentage = rows.length === 0 ? 0 : Math.round((validItems / rows.length) * 100);

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
                                        {validItems} items
                                    </CBadge>
                                </div>
                            </div>
                        </CAccordionHeader>
                        <CAccordionBody className="p-3">
                            <div className="">

                                <div className="d-flex flex-column gap-3">
                                    {rows.map((row, index) => (
                                        <CRow
                                            key={row.id}
                                            className={`align-items-start g-2 ${editingIndex === index ? "" : ""
                                                }`}
                                        >
                                            {/* Key */}
                                            <CCol md={5} xs={12}>
                                                <label className="form-label">Key</label>
                                                <CKEditorComponent
                                                    value={row.key}
                                                    placeholder={keyPlaceholder}
                                                    onChange={(data) => updateRow(row.id, "key", data)}
                                                    onFocus={() => setEditingIndex(index)}
                                                    onBlur={() => setEditingIndex(null)}
                                                    className="shadow-none"
                                                />
                                            </CCol>

                                            {/* Value */}
                                            <CCol md={6} xs={12}>
                                                <label className="form-label">Value</label>
                                                <CKEditorComponent
                                                    value={row.value}
                                                    placeholder={valuePlaceholder}
                                                    onChange={(data) => updateRow(row.id, "value", data)}
                                                    onFocus={() => setEditingIndex(index)}
                                                    onBlur={() => setEditingIndex(null)}
                                                    className="shadow-none"
                                                />
                                            </CCol>

                                            {/* Delete Button */}
                                            <CCol
                                                md={1}
                                                xs={12}
                                                className="d-flex justify-content-center justify-content-md-end align-items-start"
                                            >
                                                <CTooltip content="Delete row">
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeRow(row.id)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </CTooltip>
                                            </CCol>
                                        </CRow>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <div>
                                    {validItems === 0 ? (
                                        <small className="text-muted">
                                            <CIcon icon={cilInfo} className="me-1" />
                                            Add your first item to get started
                                        </small>
                                    ) : (
                                        <small className="text-success">
                                            <CIcon icon={cilCheckCircle} className="me-1" />
                                            {validItems} valid items
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
                                                setRows([{ id: generateId(), key: '', value: '' }]);
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
            const option = options?.find(opt => opt._id === id);
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

/* ---------- Extra Section Components ---------- */

// Overview Section Component
const OverviewSection = ({ data = {}, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="p-3">
            <CRow className="g-3">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Overview title</CFormLabel>
                    <CFormInput
                        value={data.title || ''}
                        onChange={(value) => handleChange('title', event.target.value)}
                        placeholder="Write an overview title..."
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Overview Content</CFormLabel>
                    <CKEditorComponent
                        value={data.content || ''}
                        onChange={(value) => handleChange('content', value)}
                        placeholder="Write an overview of the scholarship..."
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Key Highlights</CFormLabel>
                    <KeyValueEditor
                        label="Highlights"
                        value={data.highlights || {}}
                        onChange={(value) => handleChange('highlights', value)}
                        keyPlaceholder="Feature"
                        valuePlaceholder="Description"
                        addButtonText="Add Highlight"
                        allowTextarea={false}
                    />
                </CCol>
            </CRow>
        </div>
    );
};

const ContentSection = ({ data = {}, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="p-3">
            <CRow className="g-3">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Overview title</CFormLabel>
                    <CFormInput
                        value={data.title || ''}
                        onChange={(value) => handleChange('title', event.target.value)}
                        placeholder="Write an overview title..."
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Overview Content</CFormLabel>
                    <CKEditorComponent
                        value={data.content || ''}
                        onChange={(value) => handleChange('content', value)}
                        placeholder="Write an overview of the scholarship..."
                    />
                </CCol>
            </CRow>
        </div>
    );
};

// Why Choose Section Component
const WhyChooseSection = ({ data = {}, onChange }) => {
    const [cards, setCards] = useState(data.cards || []);
    const [editingCardIndex, setEditingCardIndex] = useState(null);
    const [newCard, setNewCard] = useState({ title: '', subtitle: '', iconName: '' });

    useEffect(() => {
        if (data.cards) {
            setCards(data.cards);
        }
    }, [data.cards]);

    const handleCardChange = (index, field, value) => {
        const updatedCards = cards.map((card, i) =>
            i === index ? { ...card, [field]: value } : card
        );
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const addCard = () => {
        if (!newCard.title.trim()) return;
        const updatedCards = [...cards, newCard];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
        setNewCard({ title: '', subtitle: '', iconName: '' });
    };

    const removeCard = (index) => {
        const updatedCards = cards.filter((_, i) => i !== index);
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const moveCardUp = (index) => {
        if (index === 0) return;
        const updatedCards = [...cards];
        [updatedCards[index - 1], updatedCards[index]] = [updatedCards[index], updatedCards[index - 1]];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const moveCardDown = (index) => {
        if (index === cards.length - 1) return;
        const updatedCards = [...cards];
        [updatedCards[index], updatedCards[index + 1]] = [updatedCards[index + 1], updatedCards[index]];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    return (
        <div className="p-3">
            <CRow className="g-3 mb-4">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Title</CFormLabel>
                    <CFormInput
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Why Choose This Scholarship?"
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Subtitle</CFormLabel>
                    <CKEditorComponent
                        value={data.subtitle || ""}
                        placeholder="Brief subtitle for the section"
                        onChange={(value) =>
                            onChange({
                                ...data,
                                subtitle: value,
                            })
                        }
                    />
                </CCol>
            </CRow>

            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Cards</h6>
                {cards.map((card, index) => (
                    <CCard key={index} className="mb-3 border">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <CBadge color="secondary" className="me-2">{index + 1}</CBadge>
                                    <strong>{card.title || 'Untitled Card'}</strong>
                                </div>
                                <div className="d-flex gap-2">
                                    <CButton
                                        size="sm"
                                        color="secondary"
                                        variant="outline"
                                        onClick={() => moveCardUp(index)}
                                        disabled={index === 0}
                                    >
                                        <CIcon icon={cilArrowTop} />
                                    </CButton>
                                    <CButton
                                        size="sm"
                                        color="secondary"
                                        variant="outline"
                                        onClick={() => moveCardDown(index)}
                                        disabled={index === cards.length - 1}
                                    >
                                        <CIcon icon={cilArrowBottom} />
                                    </CButton>
                                    <CButton
                                        size="sm"
                                        color="danger"
                                        variant="ghost"
                                        onClick={() => removeCard(index)}
                                    >
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </div>
                            </div>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Card Title</CFormLabel>
                                    <CFormInput
                                        value={card.title || ''}
                                        onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                                        placeholder="Card title"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Icon Name</CFormLabel>
                                    <CFormInput
                                        value={card.iconName || ''}
                                        onChange={(e) => handleCardChange(index, 'iconName', e.target.value)}
                                        placeholder="Card icon"
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel>Card Subtitle</CFormLabel>
                                    <CKEditorComponent
                                        value={card.subtitle || ""}
                                        placeholder="Card subtitle"
                                        onChange={(data) => handleCardChange(index, "subtitle", data)}
                                    />
                                </CCol>

                            </CRow>
                        </CCardBody>
                    </CCard>
                ))}

                {/* Add New Card */}
                <CCard className="border-dashed">
                    <CCardBody>
                        <h6 className="fw-semibold mb-3">Add New Card</h6>
                        <CRow className="g-3">
                            <CCol md={6}>
                                <CFormInput
                                    placeholder="Card Title"
                                    value={newCard.title}
                                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                                />
                            </CCol>
                            <CCol md={5}>

                                <CFormInput
                                    placeholder="Card icon"
                                    value={newCard.iconName}
                                    onChange={(e) => setNewCard({ ...newCard, iconName: e.target.value })}
                                />
                            </CCol>
                            <CCol md={11}>
                                <CKEditorComponent
                                    value={newCard.subtitle}
                                    placeholder="Card Subtitle"
                                    onChange={(data) =>
                                        setNewCard((prev) => ({
                                            ...prev,
                                            subtitle: data,
                                        }))
                                    }
                                />
                            </CCol>

                            <CCol md={1}>
                                <CButton
                                    color="primary"
                                    onClick={addCard}
                                    disabled={!newCard.title.trim()}
                                    className="w-100"
                                >
                                    <CIcon icon={cilPlus} />
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </div>

            <CRow className="g-3">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Additional Content</CFormLabel>
                    <CKEditorComponent
                        value={data.additionalContent || ''}
                        onChange={(value) => onChange({ ...data, additionalContent: value })}
                        placeholder="Any additional content for this section..."
                    />
                </CCol>
            </CRow>
        </div>
    );
};

const StepsSection = ({ data = {}, onChange }) => {
    const [cards, setCards] = useState(data.cards || []);
    const [editingCardIndex, setEditingCardIndex] = useState(null);
    const [newCard, setNewCard] = useState({ title: '', subtitle: '', iconName: '' });

    useEffect(() => {
        if (data.cards) {
            setCards(data.cards);
        }
    }, [data.cards]);

    const handleCardChange = (index, field, value) => {
        const updatedCards = cards.map((card, i) =>
            i === index ? { ...card, [field]: value } : card
        );
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const addCard = () => {
        if (!newCard.title.trim()) return;
        const updatedCards = [...cards, newCard];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
        setNewCard({ title: '', subtitle: '', iconName: '' });
    };

    const removeCard = (index) => {
        const updatedCards = cards.filter((_, i) => i !== index);
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const moveCardUp = (index) => {
        if (index === 0) return;
        const updatedCards = [...cards];
        [updatedCards[index - 1], updatedCards[index]] = [updatedCards[index], updatedCards[index - 1]];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    const moveCardDown = (index) => {
        if (index === cards.length - 1) return;
        const updatedCards = [...cards];
        [updatedCards[index], updatedCards[index + 1]] = [updatedCards[index + 1], updatedCards[index]];
        setCards(updatedCards);
        onChange({ ...data, cards: updatedCards });
    };

    return (
        <div className="p-3">
            <CRow className="g-3 mb-4">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Title</CFormLabel>
                    <CFormInput
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Why Choose This Scholarship?"
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Subtitle</CFormLabel>
                    <CKEditorComponent
                        value={data.subtitle || ""}
                        placeholder="Brief subtitle for the section"
                        onChange={(value) =>
                            onChange({
                                ...data,
                                subtitle: value,
                            })
                        }
                    />
                </CCol>
            </CRow>

            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Cards</h6>
                {cards.map((card, index) => (
                    <CCard key={index} className="mb-3 border">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <CBadge color="secondary" className="me-2">{index + 1}</CBadge>
                                    <strong>{card.title || 'Untitled Card'}</strong>
                                </div>
                                <div className="d-flex gap-2">
                                    <CButton
                                        size="sm"
                                        color="secondary"
                                        variant="outline"
                                        onClick={() => moveCardUp(index)}
                                        disabled={index === 0}
                                    >
                                        <CIcon icon={cilArrowTop} />
                                    </CButton>
                                    <CButton
                                        size="sm"
                                        color="secondary"
                                        variant="outline"
                                        onClick={() => moveCardDown(index)}
                                        disabled={index === cards.length - 1}
                                    >
                                        <CIcon icon={cilArrowBottom} />
                                    </CButton>
                                    <CButton
                                        size="sm"
                                        color="danger"
                                        variant="ghost"
                                        onClick={() => removeCard(index)}
                                    >
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </div>
                            </div>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormLabel>Card Title</CFormLabel>
                                    <CFormInput
                                        value={card.title || ''}
                                        onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                                        placeholder="Card title"
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Icon Name</CFormLabel>
                                    <CFormInput
                                        value={card.iconName || ''}
                                        onChange={(e) => handleCardChange(index, 'iconName', e.target.value)}
                                        placeholder="Card icon"
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel>Card Subtitle</CFormLabel>
                                    <CKEditorComponent
                                        value={card.subtitle || ""}
                                        placeholder="Card subtitle"
                                        onChange={(data) => handleCardChange(index, "subtitle", data)}
                                    />
                                </CCol>

                            </CRow>
                        </CCardBody>
                    </CCard>
                ))}

                {/* Add New Card */}
                <CCard className="border-dashed">
                    <CCardBody>
                        <h6 className="fw-semibold mb-3">Add New Card</h6>
                        <CRow className="g-3">
                            <CCol md={6}>
                                <CFormInput
                                    placeholder="Card Title"
                                    value={newCard.title}
                                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                                />
                            </CCol>
                            <CCol md={5}>

                                <CFormInput
                                    placeholder="Card icon"
                                    value={newCard.iconName}
                                    onChange={(e) => setNewCard({ ...newCard, iconName: e.target.value })}
                                />
                            </CCol>
                            <CCol md={11}>
                                <CKEditorComponent
                                    value={newCard.subtitle}
                                    placeholder="Card Subtitle"
                                    onChange={(data) =>
                                        setNewCard((prev) => ({
                                            ...prev,
                                            subtitle: data,
                                        }))
                                    }
                                />
                            </CCol>

                            <CCol md={1}>
                                <CButton
                                    color="primary"
                                    onClick={addCard}
                                    disabled={!newCard.title.trim()}
                                    className="w-100"
                                >
                                    <CIcon icon={cilPlus} />
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </div>

            <CRow className="g-3">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Additional Content</CFormLabel>
                    <CKEditorComponent
                        value={data.additionalContent || ''}
                        onChange={(value) => onChange({ ...data, additionalContent: value })}
                        placeholder="Any additional content for this section..."
                    />
                </CCol>
            </CRow>
        </div>
    );
};

// Documents Section Component
const DocumentsSection = ({ data = {}, onChange }) => {
    const [documents, setDocuments] = useState(data.documents || []);
    const [newDocument, setNewDocument] = useState({ title: '', points: [''] });

    useEffect(() => {
        if (data.documents) {
            setDocuments(data.documents);
        }
    }, [data.documents]);

    const handleDocumentChange = (index, field, value) => {
        const updatedDocs = documents.map((doc, i) =>
            i === index ? { ...doc, [field]: value } : doc
        );
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
    };

    const handlePointChange = (docIndex, pointIndex, value) => {
        const updatedDocs = documents.map((doc, i) => {
            if (i === docIndex) {
                const points = [...doc.points];
                points[pointIndex] = value;
                return { ...doc, points };
            }
            return doc;
        });
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
    };

    const addPoint = (docIndex) => {
        const updatedDocs = documents.map((doc, i) => {
            if (i === docIndex) {
                return { ...doc, points: [...doc.points, ''] };
            }
            return doc;
        });
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
    };

    const removePoint = (docIndex, pointIndex) => {
        const updatedDocs = documents.map((doc, i) => {
            if (i === docIndex) {
                const points = doc.points.filter((_, pIndex) => pIndex !== pointIndex);
                return { ...doc, points };
            }
            return doc;
        });
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
    };

    const addDocument = () => {
        if (!newDocument.title.trim()) return;
        const updatedDocs = [...documents, { ...newDocument, points: newDocument.points.filter(p => p.trim()) }];
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
        setNewDocument({ title: '', points: [''] });
    };

    const removeDocument = (index) => {
        const updatedDocs = documents.filter((_, i) => i !== index);
        setDocuments(updatedDocs);
        onChange({ ...data, documents: updatedDocs });
    };

    return (
        <div className="p-3">
            <CRow className="g-3 mb-4">
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Title</CFormLabel>
                    <CFormInput
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Required Documents"
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel className="fw-semibold">Section Description</CFormLabel>

                    <CKEditorComponent
                        value={data.description || ""}
                        placeholder="Brief subtitle for the section"
                        onChange={(value) =>
                            onChange({
                                ...data,
                                description: value,
                            })
                        }
                    />
                </CCol>
            </CRow>

            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Documents</h6>
                {documents.map((doc, docIndex) => (
                    <CCard key={docIndex} className="mb-3 border">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">

                                <CButton
                                    size="sm"
                                    color="danger"
                                    variant="ghost"
                                    onClick={() => removeDocument(docIndex)}
                                >
                                    <CIcon icon={cilTrash} />
                                </CButton>
                            </div>

                            <CRow className="g-3 mb-3">
                                <CCol md={12}>
                                    <CFormLabel>Document Icon</CFormLabel>
                                    <CFormInput
                                        value={doc.icon || ''}
                                        onChange={(e) => handleDocumentChange(docIndex, 'icon', e.target.value)}
                                        placeholder="e.g.,Doucments"
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel>Document Title</CFormLabel>
                                    <CKEditorComponent
                                        value={doc.title || ''}
                                        onChange={(e) => handleDocumentChange(docIndex, 'title', e)}
                                        placeholder="e.g., Academic Transcripts"
                                    />
                                </CCol>
                                 <CCol md={12}>
                                    <CFormLabel>Document Description</CFormLabel>
                                    <CKEditorComponent
                                        value={doc.description || ''}
                                        onChange={(e) => handleDocumentChange(docIndex, 'description', e)}
                                        placeholder="e.g., Academic Transcripts"
                                    />
                                </CCol>

                            </CRow>
                        </CCardBody>
                    </CCard>
                ))}

                {/* Add New Document */}
                <CCard className="border-dashed">
                    <CCardBody>
                        <h6 className="fw-semibold mb-3">Add New Document</h6>
                        <CRow className="g-3">
                            <CCol md={8}>
                                <CKEditorComponent
                                    placeholder="Document Title"
                                    value={newDocument.title}
                                    onChange={(e) => setNewDocument({ ...newDocument, title: e })}
                                />
                            </CCol>
                            <CCol md={4}>
                                <CButton
                                    color="primary"
                                    onClick={addDocument}
                                    disabled={!newDocument.title.trim()}
                                    className="w-100"
                                >
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Add Document
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </div>
        </div>
    );
};

/* ---------- Main Extra Sections Manager ---------- */
const ExtraSectionsManager = ({ sections = [], onChange, onSectionChange }) => {
    const [activeSectionIndex, setActiveSectionIndex] = useState(null);
    const [newSectionType, setNewSectionType] = useState('');
    const [newSectionKey, setNewSectionKey] = useState('');

    const sectionTypes = [
        { value: 'overview', label: 'Overview', icon: cilInfo },
        { value: 'whyChoose', label: 'Why Choose', icon: cilStar },
        { value: 'documents', label: 'Documents', icon: cilStar },
        { value: 'content', label: 'Content Section', icon: cilStar },
        { value: 'StepsSection', label: 'Steps Section', icon: cilStar },
    ];



    const getSectionIcon = (type) => {
        const found = sectionTypes.find(st => st.value === type);
        return found ? found.icon : cilFolder;
    };

    const getSectionTypeLabel = (type) => {
        const found = sectionTypes.find(st => st.value === type);
        return found ? found.label : type;
    };

    const addSection = () => {
        if (!newSectionType || !newSectionKey.trim()) return;

        const newSection = {
            section_key: newSectionKey.trim().toLowerCase().replace(/\s+/g, '_'),
            section_type: newSectionType,
            data: {},
            order: sections.length + 1,
        };

        onSectionChange([...sections, newSection]);
        setNewSectionType('');
        setNewSectionKey('');
        setActiveSectionIndex(sections.length);
    };

    const removeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        onSectionChange(updatedSections);
        if (activeSectionIndex === index) {
            setActiveSectionIndex(null);
        }
    };

    const updateSectionData = (index, data) => {
        const updatedSections = sections.map((section, i) =>
            i === index ? { ...section, data } : section
        );
        onSectionChange(updatedSections);
    };

    const moveSectionUp = (index) => {
        if (index === 0) return;
        const updatedSections = [...sections];
        [updatedSections[index - 1], updatedSections[index]] = [updatedSections[index], updatedSections[index - 1]];
        updatedSections.forEach((section, i) => { section.order = i + 1; });
        onSectionChange(updatedSections);
    };

    const moveSectionDown = (index) => {
        if (index === sections.length - 1) return;
        const updatedSections = [...sections];
        [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
        updatedSections.forEach((section, i) => { section.order = i + 1; });
        onSectionChange(updatedSections);
    };

    const renderSectionContent = (section, index) => {
        switch (section.section_type) {
            case 'overview':
                return (
                    <OverviewSection
                        data={section.data || {}}
                        onChange={(data) => updateSectionData(index, data)}
                    />
                );
            case 'whyChoose':
                return (
                    <WhyChooseSection
                        data={section.data || {}}
                        onChange={(data) => updateSectionData(index, data)}
                    />
                );
            case 'StepsSection':
                return (
                    <StepsSection
                        data={section.data || {}}
                        onChange={(data) => updateSectionData(index, data)}
                    />
                );
            case 'documents':
                return (
                    <DocumentsSection
                        data={section.data || {}}
                        onChange={(data) => updateSectionData(index, data)}
                    />
                );
            case 'content':
                return (
                    <ContentSection
                        data={section.data || {}}
                        onChange={(data) => updateSectionData(index, data)}
                    />
                );
            default:
                return (
                    <div className="p-3 text-center text-muted">
                        <p>Unknown section type: {section.section_type}</p>
                    </div>
                );
        }
    };

    return (
        <CCard className="mb-4">
            <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Extra Content Sections</h5>
                    <CBadge color="info">{sections.length} sections</CBadge>
                </div>
            </CCardHeader>
            <CCardBody>
                {/* Add New Section */}
                <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="fw-semibold mb-3">Add New Section</h6>
                    <CRow className="g-3">
                        <CCol md={5}>
                            <CFormLabel>Section Key</CFormLabel>
                            <CFormInput
                                placeholder="section_key (auto-generated)"
                                value={newSectionKey}
                                onChange={(e) => setNewSectionKey(e.target.value)}
                            />
                            <small className="text-muted">Will be used as identifier (e.g., academic_requirements)</small>
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel>Section Type</CFormLabel>
                            <CFormSelect
                                value={newSectionType}
                                onChange={(e) => setNewSectionType(e.target.value)}
                            >
                                <option value="">Select Section Type</option>
                                {sectionTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={3} className="d-flex align-items-center pt-1">
                            <CButton
                                color="primary"
                                onClick={addSection}
                                disabled={!newSectionType || !newSectionKey.trim()}
                                className="w-100"
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Add Section
                            </CButton>
                        </CCol>
                    </CRow>
                </div>

                {/* Existing Sections */}
                {sections.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <p>No extra sections added yet.</p>
                        <small>Add a new section using the form above.</small>
                    </div>
                ) : (
                    <CAccordion activeItemKey={activeSectionIndex}>
                        {sections.map((section, index) => (
                            <CAccordionItem key={index} itemKey={index}>
                                <CAccordionHeader onClick={() => setActiveSectionIndex(index)}>
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <div className="d-flex align-items-center gap-3">
                                            <CIcon icon={getSectionIcon(section.section_type)} className="text-primary" />
                                            <div>
                                                <strong>{section.section_key}</strong>
                                                <CBadge color="secondary" className="ms-2">
                                                    {getSectionTypeLabel(section.section_type)}
                                                </CBadge>
                                                <small className="text-muted d-block">
                                                    Order: {section.order || index + 1}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <CButton
                                                size="sm"
                                                color="secondary"
                                                variant="outline"
                                                onClick={(e) => { e.stopPropagation(); moveSectionUp(index); }}
                                                disabled={index === 0}
                                            >
                                                <CIcon icon={cilArrowTop} />
                                            </CButton>
                                            <CButton
                                                size="sm"
                                                color="secondary"
                                                variant="outline"
                                                onClick={(e) => { e.stopPropagation(); moveSectionDown(index); }}
                                                disabled={index === sections.length - 1}
                                            >
                                                <CIcon icon={cilArrowBottom} />
                                            </CButton>
                                            <CButton
                                                size="sm"
                                                color="danger"
                                                variant="ghost"
                                                onClick={(e) => { e.stopPropagation(); removeSection(index); }}
                                            >
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </div>
                                    </div>
                                </CAccordionHeader>
                                <CAccordionBody>
                                    {renderSectionContent(section, index)}
                                </CAccordionBody>
                            </CAccordionItem>
                        ))}
                    </CAccordion>
                )}
            </CCardBody>
        </CCard>
    );
};

/* ---------- Main Scholarship Form ---------- */
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
        shortDescription: '',
        subjects: [],
        country: '',
        sections: [],
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
        extraStatus: 'Active',
        seoTitle: "",
        seoDescription: "",
        seoKeyword: "",
        cover_photo: '',
        cta: {
            title: "",
            description: "",
        },
    });

    const [formErrors, setFormErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        if (scholarship) {
            const subjectsArray = scholarship.subjects || [];
            setFormData({
                title: scholarship.title || '',
                slug: scholarship.slug || '',
                description: scholarship.description || '',
                shortDescription: scholarship.shortDescription || '',
                cover_photo: scholarship.cover_photo || '',
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
                sections: scholarship?.extra_content?.sections || [],
                extraStatus: scholarship.extraStatus || 'Active',
                seoTitle: scholarship.seoTitle || "",
                seoDescription: scholarship.seoDescription || "",
                seoKeyword: scholarship.seoKeyword || "",
                cta: scholarship.cta || {
                    title: "",
                    description: "",
                }
            });
        }
    }, [scholarship]);


    const handleCTAChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            cta: {
                ...prev.cta,
                [name]: value,
            },
        }));
    };

    const handleLogoUpload = async (e, key) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Only image files are allowed')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be < 2MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
        setUploadingImage(true)
        try {
            const res = await uploadService.uploadImage(file)
            if (res.success) {
                setFormData(prev => ({ ...prev, [key]: res.data.url }))
            }
        } catch (err) {
            alert(err.message || 'Upload failed')
        } finally {
            setUploadingImage(false)
        }
    }

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

    const handleSectionsChange = (sections) => {
        setFormData(prev => ({ ...prev, sections }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        if (formData.subjects.length === 0) errors.subjects = 'At least one subject is required';
        if (!formData.country) errors.country = 'Country is required';
        // if (!formData.university) errors.university = 'University is required';
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

            {/* Basic Information */}
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
                    <CFormLabel className="fw-semibold">Short Description</CFormLabel>
                    <CFormTextarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Brief summary of the scholarship (150 characters max)"
                        maxLength={150}
                    />
                </CCol>
                <CCol md={12}>
                    <CFormLabel>Cover Image</CFormLabel>
                    <CFormInput
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'cover_photo')}
                        disabled={uploadingImage}
                    />
                    {uploadingImage && <CSpinner size="sm" className="ms-2" />}
                    <small className="text-muted">Max size: 5MB (PNG, JPG, JPEG)</small>
                    {(formData.cover_photo) && (
                        <CCol md={6}>
                            <CFormLabel>Cover Preview</CFormLabel>
                            <div className="mt-2">
                                <img
                                    src={formData?.cover_photo}
                                    alt="cover image"
                                    style={{
                                        height: '100px',
                                        objectFit: 'contain',
                                        backgroundColor: '#f8f9fa',
                                        padding: '10px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </CCol>
                    )}
                </CCol>
            </CRow>

            {/* SEO Information */}
            <CRow className="g-3 mb-4">
                <CCol md={8}>
                    <CFormLabel className="fw-semibold">
                        SEO Title <span className="text-danger">*</span>
                    </CFormLabel>
                    <CInputGroup>
                        <CInputGroupText>
                            <CIcon icon={cilPencil} />
                        </CInputGroupText>
                        <CFormInput
                            name="seoTitle"
                            value={formData.seoTitle}
                            onChange={handleChange}
                            placeholder="e.g., International Excellence Scholarship"
                            invalid={!!formErrors.title}
                            required
                        />
                    </CInputGroup>
                    {formErrors.title && <div className="invalid-feedback d-block">{formErrors.title}</div>}
                </CCol>

                <CCol md={12}>
                    <CFormLabel className="fw-semibold">SEO Description</CFormLabel>
                    <CFormTextarea
                        name='seoDescription'
                        value={formData.seoDescription}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Brief summary of the scholarship (150 characters max)"
                    />
                </CCol>

                <CCol md={12}>
                    <CFormLabel className="fw-semibold">SEO Keyword</CFormLabel>
                    <CFormInput
                        name="seoKeyword"
                        value={formData.seoKeyword}
                        onChange={handleChange}
                        placeholder="e.g., International Excellence Scholarship"
                        required
                    />
                </CCol>
            </CRow>

            {/* Location & University */}
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
                {/* 
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
                </CCol> */}
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

            {/* Funding Details */}
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

            {/* CTA Section */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5 className="mb-0">Call To Action (CTA)</h5>
                </CCardHeader>

                <CCardBody>
                    <CRow className="g-3">

                        <CCol md={12}>
                            <CFormLabel className="fw-semibold">
                                CTA Title
                            </CFormLabel>

                            <CFormInput
                                name="title"
                                value={formData.cta.title}
                                onChange={handleCTAChange}
                                placeholder="Ready to Apply for this Scholarship?"
                            />
                        </CCol>

                        <CCol md={12}>
                            <CFormLabel className="fw-semibold">
                                CTA Description
                            </CFormLabel>

                            <CFormTextarea
                                rows={4}
                                name="description"
                                value={formData.cta.description}
                                onChange={handleCTAChange}
                                placeholder="Start your application today and let our experts guide you through the admission process."
                            />
                        </CCol>

                    </CRow>
                </CCardBody>
            </CCard>

            {/* Extra Sections */}
            <ExtraSectionsManager
                sections={formData.sections}
                onSectionChange={handleSectionsChange}
            />

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
                        <CCol md={6}>
                            <div className="form-check form-switch">
                                <CFormCheck
                                    label="Extra Content Active"
                                    checked={formData.extraStatus === 'Active'}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        extraStatus: e.target.checked ? 'Active' : 'Inactive'
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