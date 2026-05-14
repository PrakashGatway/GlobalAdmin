import React, { useState, useEffect, useCallback } from 'react'
import {
  CAvatar,
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CAlert,
  CSpinner,
  CPagination,
  CPaginationItem,
  CContainer,
  CTooltip,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormCheck,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFlagAlt,
  cilPencil,
  cilTrash,
  cilMagnifyingGlass,
  cilPlus,
  cilChevronLeft,
  cilChevronRight,
  cilFilter,
  cilSortAscending,
  cilImage,
  cilInfo,
  // cilDocument,
  cilMoney,
  cilList,
  cilCheckCircle,
  cilCalendar,
  cilMap,
} from '@coreui/icons'

import countryService from '../../services/countryService'
import uploadService from '../../services/uploadService'
import { FaPlus, FaTrash, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import CKEditorComponent from '../page-information/Ckeditor'

const Countries = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Filters + Pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    populateExtra: 'true',
  })

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: '',
    status: 'Active',
    isFeatured: 'No',
    flg: '',
    sections: [],
    extraStatus: 'Active',
    faq: [],
    visa_details: {
      type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
    }
  })

  const [newSection, setNewSection] = useState({ section_key: '', heading: '', content: '', order: 0 })
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [newFee, setNewFee] = useState({ type: '', amount: '', currency: 'USD', is_refundable: false, notes: '' })
  const [newProcessStep, setNewProcessStep] = useState({
    step_number: 1,
    title: '',
    action: '',
    location: '',
    description: '',
    documents_required: [],
    tips: [],
    possible_questions: [],
    estimated_duration_days: null
  })
  const [newMandatoryDocument, setNewMandatoryDocument] = useState('')
  const [newSupportingDocument, setNewSupportingDocument] = useState('')

  // ================= FETCH =================
  const fetchCountries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await countryService.getCountries(filters)
      if (res.success) {
        setCountries(res.data || [])
        setTotal(res.total || 0)
        setTotalPages(res.pages || 1)
      } else {
        setError(res.message || 'Failed to fetch countries')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch countries')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  // ================= HANDLERS =================

  const handleAddSection = () => {
    if (!newSection.section_key || !newSection.heading) return

    const order = newSection.order || formData.sections.length + 1
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { ...newSection, order }]
    }))
    setNewSection({ section_key: '', heading: '', content: '', order: 0 })
  }

  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) return

    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: newFaq.question, answer: newFaq.answer }]
    }))
    setNewFaq({ question: '', answer: '' })
  }

  const handleAddFee = () => {
    if (!newFee.type || !newFee.amount) return

    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          fees: [...prev.visa_details.type.fees, { ...newFee, amount: parseFloat(newFee.amount) }]
        }
      }
    }))
    setNewFee({ type: '', amount: '', currency: 'USD', is_refundable: false, notes: '' })
  }

  const handleAddProcessStep = () => {
    if (!newProcessStep.title || !newProcessStep.action || !newProcessStep.location) return

    const stepNumber = newProcessStep.step_number || formData.visa_details.type.process_steps.length + 1
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          process_steps: [...prev.visa_details.type.process_steps, { ...newProcessStep, step_number: stepNumber }]
        }
      }
    }))
    setNewProcessStep({
      step_number: formData.visa_details.type.process_steps.length + 2,
      title: '',
      action: '',
      location: '',
      description: '',
      documents_required: [],
      tips: [],
      possible_questions: [],
      estimated_duration_days: null
    })
  }

  const handleAddMandatoryDocument = () => {
    if (!newMandatoryDocument.trim()) return
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          required_documents: {
            ...prev.visa_details.type.required_documents,
            mandatory: [...prev.visa_details.type.required_documents.mandatory, newMandatoryDocument.trim()]
          }
        }
      }
    }))
    setNewMandatoryDocument('')
  }

  const handleAddSupportingDocument = () => {
    if (!newSupportingDocument.trim()) return
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          required_documents: {
            ...prev.visa_details.type.required_documents,
            supporting: [...prev.visa_details.type.required_documents.supporting, newSupportingDocument.trim()]
          }
        }
      }
    }))
    setNewSupportingDocument('')
  }

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveFee = (index) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          fees: prev.visa_details.type.fees.filter((_, i) => i !== index)
        }
      }
    }))
  }

  const handleRemoveProcessStep = (index) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          process_steps: prev.visa_details.type.process_steps.filter((_, i) => i !== index)
        }
      }
    }))
  }

  const handleRemoveMandatoryDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          required_documents: {
            ...prev.visa_details.type.required_documents,
            mandatory: prev.visa_details.type.required_documents.mandatory.filter((_, i) => i !== index)
          }
        }
      }
    }))
  }

  const handleRemoveSupportingDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          required_documents: {
            ...prev.visa_details.type.required_documents,
            supporting: prev.visa_details.type.required_documents.supporting.filter((_, i) => i !== index)
          }
        }
      }
    }))
  }

  const handleUpdateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const handleUpdateFaq = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }))
  }

  const handleUpdateFee = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          fees: prev.visa_details.type.fees.map((fee, i) =>
            i === index ? { ...fee, [field]: field === 'amount' ? parseFloat(value) : value } : fee
          )
        }
      }
    }))
  }

  const handleUpdateProcessStep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      visa_details: {
        ...prev.visa_details,
        type: {
          ...prev.visa_details.type,
          process_steps: prev.visa_details.type.process_steps.map((step, i) =>
            i === index ? { ...step, [field]: value } : step
          )
        }
      }
    }))
  }

  const handleMoveSectionUp = (index) => {
    if (index === 0) return
    setFormData(prev => {
      const newSections = [...prev.sections]
      const temp = newSections[index]
      newSections[index] = newSections[index - 1]
      newSections[index - 1] = temp
      newSections.forEach((section, i) => {
        section.order = i + 1
      })
      return { ...prev, sections: newSections }
    })
  }

  const handleMoveSectionDown = (index) => {
    if (index === formData.sections.length - 1) return
    setFormData(prev => {
      const newSections = [...prev.sections]
      const temp = newSections[index]
      newSections[index] = newSections[index + 1]
      newSections[index + 1] = temp
      newSections.forEach((section, i) => {
        section.order = i + 1
      })
      return { ...prev, sections: newSections }
    })
  }

  const handleMoveProcessStepUp = (index) => {
    if (index === 0) return
    setFormData(prev => {
      const newSteps = [...prev.visa_details.type.process_steps]
      const temp = newSteps[index]
      newSteps[index] = newSteps[index - 1]
      newSteps[index - 1] = temp
      newSteps.forEach((step, i) => {
        step.step_number = i + 1
      })
      return {
        ...prev,
        visa_details: {
          ...prev.visa_details,
          type: {
            ...prev.visa_details.type,
            process_steps: newSteps
          }
        }
      }
    })
  }

  const handleMoveProcessStepDown = (index) => {
    if (index === formData.visa_details.type.process_steps.length - 1) return
    setFormData(prev => {
      const newSteps = [...prev.visa_details.type.process_steps]
      const temp = newSteps[index]
      newSteps[index] = newSteps[index + 1]
      newSteps[index + 1] = temp
      newSteps.forEach((step, i) => {
        step.step_number = i + 1
      })
      return {
        ...prev,
        visa_details: {
          ...prev.visa_details,
          type: {
            ...prev.visa_details.type,
            process_steps: newSteps
          }
        }
      }
    })
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setFilters(prev => ({ ...prev, page }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVisaDetailsChange = (path, value) => {
    setFormData(prev => {
      const newVisaDetails = { ...prev.visa_details }
      const keys = path.split('.')
      let current = newVisaDetails
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return { ...prev, visa_details: newVisaDetails }
    })
  }

  // ================= IMAGE UPLOAD =================
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      const res = await uploadService.uploadImage(file)
      if (res.success) {
        setFormData(prev => ({ ...prev, flg: res.data.url }))
        setImagePreview(res.data.url)
      } else {
        setError(res.message || 'Image upload failed')
      }
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  // ================= CRUD =================
  const handleEdit = (country) => {
    setFormData({
      name: country.name || '',
      code: country.code || '',
      isFeatured: country.isFeatured || 'No',
      currency: country.currency || '',
      status: country.status || 'Active',
      flg: country.flg || '',
      sections: country.extra_content?.[0]?.sections || [],
      extraStatus: country.extra_content?.[0]?.status || 'Active',
      faq: country.extra_content?.[0]?.faq || [],
      visa_details: country.visa_details || {
         type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
      }
    })
    setImagePreview(country.flg || '')
    setEditingId(country._id)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      const res = await countryService.deleteCountry(deletingId)
      if (res.success) {
        setSuccess('Country deleted successfully')
        setShowDeleteModal(false)
        setDeletingId(null)
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res.message || 'Delete failed')
      }
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Country name is required')
      return
    }
    if (!formData.code.trim()) {
      setError('Country code is required')
      return
    }
    if (!formData.currency.trim()) {
      setError('Currency is required')
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        currency: formData.currency.trim().toUpperCase(),
        status: formData.status,
        isFeatured: formData.isFeatured,
        flg: formData.flg,
        extra_details: {
          sections: formData.sections,
          status: formData.extraStatus,
          faq: formData.faq || []
        },
        visa_details: formData.visa_details
      }
      
      let res
      if (editingId) {
        res = await countryService.updateCountry(editingId, payload)
        if (res.success) setSuccess('Country updated successfully')
      } else {
        res = await countryService.createCountry(payload)
        if (res.success) setSuccess('Country created successfully')
      }

      if (res.success) {
        setShowModal(false)
        setEditingId(null)
        setFormData({ 
          name: '', 
          code: '', 
          currency: '', 
          status: 'Active', 
          isFeatured: 'No',
          flg: '',
          sections: [],
          extraStatus: 'Active',
          faq: [],
          visa_details: {
             type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
          }
        })
        setImagePreview('')
        fetchCountries()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res.message || 'Operation failed')
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    }
  }

  // ================= PAGINATION HELPERS =================
  const getPaginationRange = () => {
    const current = filters.page
    const total = totalPages
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  // ================= UI =================
  return (
    <CContainer fluid>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
              <div>
                <h5 className="mb-1 fw-bold">Countries Management</h5>
                <small className="text-muted">Manage country information, flags, and currencies</small>
              </div>
              <CButton 
                color="primary" 
                onClick={() => {
                  setEditingId(null)
                  setFormData({ 
                    name: '', 
                    code: '', 
                    currency: '', 
                    status: 'Active', 
                    isFeatured: 'No',
                    flg: '',
                    sections: [],
                    extraStatus: 'Active',
                    faq: [],
                    visa_details: {
                     type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
                    }
                  })
                  setImagePreview('')
                  setShowModal(true)
                }}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilPlus} className="me-2" /> Add Country
              </CButton>
            </CCardHeader>

            {/* FILTERS */}
            <CCardBody className="bg-light border-bottom">
              <CRow className="g-3 align-items-end">
                <CCol md={4}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Search</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText className="bg-white">
                        <CIcon icon={cilMagnifyingGlass} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Search by name or code..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="border-start-0"
                      />
                    </CInputGroup>
                  </div>
                </CCol>

                <CCol md={3}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Status</CFormLabel>
                    <CFormSelect
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </div>
                </CCol>

                <CCol md={3}>
                  <div className="mb-2">
                    <CFormLabel className="text-muted small">Items per page</CFormLabel>
                    <CFormSelect
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                      className="bg-white"
                    >
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="20">20 items</option>
                      <option value="50">50 items</option>
                    </CFormSelect>
                  </div>
                </CCol>

                <CCol md={2} className="d-flex justify-content-end">
                  <CTooltip content="Clear filters">
                    <CButton
                      color="light"
                      variant="outline"
                      onClick={() => {
                        setFilters({
                          search: '',
                          status: '',
                          page: 1,
                          limit: 10,
                          sortBy: 'name',
                          sortOrder: 'asc'
                        })
                      }}
                      className="d-flex align-items-center"
                    >
                      <CIcon icon={cilFilter} className="me-1" /> Clear
                    </CButton>
                  </CTooltip>
                </CCol>
              </CRow>

              {/* Results Summary */}
              {total > 0 && (
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">
                      Showing <strong>{((filters.page - 1) * filters.limit) + 1}</strong> to{' '}
                      <strong>{Math.min(filters.page * filters.limit, total)}</strong> of{' '}
                      <strong>{total}</strong> countries
                    </span>
                  </div>
                  <div>
                    <CBadge color="light" className="text-dark">
                      Page {filters.page} of {totalPages}
                    </CBadge>
                  </div>
                </div>
              )}
            </CCardBody>

            {/* TABLE */}
            <CCardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2 text-muted">Loading countries...</p>
                </div>
              ) : error && !loading ? (
                <div className="text-center py-5">
                  <CIcon icon={cilFlagAlt} size="xxl" className="text-muted mb-3" />
                  <p className="text-danger">{error}</p>
                  <CButton color="primary" onClick={fetchCountries}>
                    Retry
                  </CButton>
                </div>
              ) : countries.length === 0 ? (
                <div className="text-center py-5">
                  <CIcon icon={cilFlagAlt} size="xxl" className="text-muted mb-3" />
                  <h5 className="text-muted">No countries found</h5>
                  <p className="text-muted">Try adjusting your search or add a new country.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable className="mb-0" align="middle">
                    <CTableHead className="bg-light">
                      <CTableRow>
                        <CTableHeaderCell className="text-center" style={{ width: '80px' }}>
                          <CIcon icon={cilFlagAlt} className="me-1" /> Flag
                        </CTableHeaderCell>
                        <CTableHeaderCell>
                          <div className="d-flex align-items-center">
                            Name
                            <CIcon icon={cilSortAscending} className="ms-1 text-muted" />
                          </div>
                        </CTableHeaderCell>
                        <CTableHeaderCell>Code</CTableHeaderCell>
                        <CTableHeaderCell>Currency</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Featured</CTableHeaderCell>
                        <CTableHeaderCell className="text-center" style={{ width: '120px' }}>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {countries.map((c, index) => (
                        <CTableRow key={c._id} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
                          <CTableDataCell className="text-center">
                            {c.flg ? (
                              <img 
                                src={c.flg} 
                                width="36" 
                                height="24" 
                                className="rounded border"
                                alt={c.name}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = `https://via.placeholder.com/36x24/cccccc/ffffff?text=${c.code}`
                                }}
                              />
                            ) : (
                              <div className="d-flex justify-content-center">
                                <CAvatar color="light" className="text-dark border" size="md">
                                  {c.name?.charAt(0) || '?'}
                                </CAvatar>
                              </div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="fw-semibold">{c.name}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="light" className="text-dark border">
                              {c.code}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{c.currency || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge 
                              color={c.status === 'Active' ? 'success' : 'secondary'} 
                              shape="rounded-pill"
                              className="px-3"
                            >
                              {c.status}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge 
                              color={c.isFeatured === 'Yes' ? 'success' : 'secondary'} 
                              shape="rounded-pill"
                              className="px-3"
                            >
                              {c.isFeatured === 'Yes' ? 'Yes' : 'No'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div className="btn-group" role="group">
                              <CTooltip content="Edit">
                                <CButton 
                                  size="sm" 
                                  color="primary" 
                                  variant="outline"
                                  onClick={() => handleEdit(c)}
                                  className="me-1"
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                              </CTooltip>
                              <CTooltip content="Delete">
                                <CButton
                                  size="sm"
                                  color="danger"
                                  variant="outline"
                                  onClick={() => {
                                    setDeletingId(c._id)
                                    setShowDeleteModal(true)
                                  }}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CTooltip>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>

            {/* PAGINATION */}
            {totalPages > 1 && !loading && (
              <CCardFooter className="bg-white border-top">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="text-muted small">
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, total)} of {total} entries
                  </div>
                  <CPagination aria-label="Page navigation" className="mb-0">
                    <CPaginationItem 
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                    >
                      <CIcon icon={cilChevronLeft} />
                    </CPaginationItem>
                    
                    {getPaginationRange().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <CPaginationItem key={`dots-${index}`} disabled>
                          ...
                        </CPaginationItem>
                      ) : (
                        <CPaginationItem
                          key={pageNum}
                          active={filters.page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </CPaginationItem>
                      )
                    ))}
                    
                    <CPaginationItem 
                      disabled={filters.page === totalPages}
                      onClick={() => handlePageChange(filters.page + 1)}
                    >
                      <CIcon icon={cilChevronRight} />
                    </CPaginationItem>
                  </CPagination>
                  
                  <div className="d-flex align-items-center">
                    <span className="text-muted small me-2">Go to page:</span>
                    <CFormSelect
                      value={filters.page}
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                      className="w-auto"
                      size="sm"
                      style={{ width: '70px' }}
                    >
                      {[...Array(totalPages)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </div>
              </CCardFooter>
            )}
          </CCard>

          {/* ADD/EDIT MODAL */}
          <CModal 
            visible={showModal} 
            onClose={() => {
              setShowModal(false)
              setEditingId(null)
              setFormData({ 
                name: '', 
                code: '', 
                currency: '', 
                status: 'Active', 
                isFeatured: 'No',
                flg: '',
                sections: [],
                extraStatus: 'Active',
                faq: [],
                visa_details: {
                  type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
                }
              })
              setImagePreview('')
              setError('')
            }} 
            size="xl"
            scrollable
          >
            <CModalHeader closeButton className="bg-light">
              <CModalTitle className="fw-bold">
                <CIcon icon={editingId ? cilPencil : cilPlus} className="me-2" />
                {editingId ? 'Edit Country' : 'Add New Country'}
              </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit} className='overflow-auto'>
              <CModalBody>
                {error && (
                  <CAlert color="danger" dismissible onClose={() => setError('')} className="mb-4">
                    {error}
                  </CAlert>
                )}
                {success && (
                  <CAlert color="success" dismissible onClose={() => setSuccess('')} className="mb-4">
                    {success}
                  </CAlert>
                )}
                
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Country Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      placeholder="Enter country name"
                      required
                    />
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Country Code <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="code" 
                      value={formData.code} 
                      onChange={handleInputChange}
                      placeholder="e.g., US, UK, IN"
                      className="text-uppercase"
                      maxLength="3"
                      required
                    />
                    <small className="text-muted">ISO 3166-1 alpha-2/3 code</small>
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">
                      Currency <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput 
                      name="currency" 
                      value={formData.currency} 
                      onChange={handleInputChange}
                      placeholder="e.g., USD, EUR, INR"
                    />
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Status</CFormLabel>
                    <CFormSelect 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </CCol>
                  
                  <CCol md={6}>
                    <CFormLabel className="fw-semibold">Featured</CFormLabel>
                    <CFormSelect 
                      name="isFeatured" 
                      value={formData.isFeatured} 
                      onChange={handleInputChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </CFormSelect>
                  </CCol>
                  
                  <CCol md={12}>
                    <CFormLabel className="fw-semibold">
                      <CIcon icon={cilImage} className="me-2" />
                      Country Flag
                    </CFormLabel>
                    <div className="border rounded p-3 bg-light">
                      <div className="d-flex align-items-center flex-wrap gap-3">
                        <div className="flex-grow-1">
                          <CFormInput 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            id="flag-upload"
                          />
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Upload flag image (PNG, JPG, SVG up to 5MB)
                          </small>
                          {uploadingImage && (
                            <div className="d-flex align-items-center mt-1">
                              <CSpinner size="sm" className="me-2" />
                              <span className="text-muted small">Uploading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-muted small mb-2">Preview:</p>
                          <img 
                            src={imagePreview} 
                            height="60" 
                            className="rounded border p-1 bg-white"
                            alt="Flag preview"
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = `https://via.placeholder.com/100x60/cccccc/ffffff?text=Flag`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                {/* Extra Content Sections */}
                <CCard className="mb-4 mt-4">
                  <CCardHeader>
                    <h5 className="mb-0">Extra Content Sections</h5>
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
                        <CButton 
                          color="primary" 
                          onClick={handleAddSection} 
                          disabled={!newSection.section_key || !newSection.heading}
                        >
                          <FaPlus className="me-1" /> Add
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Existing Sections */}
                    {formData.sections.map((section, index) => (
                      <CCard key={index} className="mb-3">
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="mb-1">{section.heading}</h6>
                              <small className="text-muted">Key: {section.section_key} | Order: {section.order}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <CButton
                                color="secondary"
                                size="sm"
                                onClick={() => handleMoveSectionUp(index)}
                                disabled={index === 0}
                              >
                                ↑
                              </CButton>
                              <CButton
                                color="secondary"
                                size="sm"
                                onClick={() => handleMoveSectionDown(index)}
                                disabled={index === formData.sections.length - 1}
                              >
                                ↓
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveSection(index)}
                              >
                                <FaTrash />
                              </CButton>
                            </div>
                          </div>

                          <div className="mb-3">
                            <CFormLabel>Section Heading</CFormLabel>
                            <CFormInput
                              type="text"
                              value={section.heading || ""}
                              onChange={(e) => handleUpdateSection(index, "heading", e.target.value)}
                              placeholder="Section heading"
                            />
                          </div>

                          <div>
                            <CFormLabel>Content</CFormLabel>
                            <CKEditorComponent
                              value={section.content || ""}
                              onChange={(value) => handleUpdateSection(index, "content", value)}
                            />
                          </div>
                        </CCardBody>
                      </CCard>
                    ))}

                    {/* Extra Content Settings */}
                    <CRow className="g-3 mt-3">
                      <CCol md={6}>
                        <CFormLabel>Extra Content Status</CFormLabel>
                        <CFormSelect
                          value={formData.extraStatus}
                          onChange={(e) => setFormData(prev => ({ ...prev, extraStatus: e.target.value }))}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>

                {/* FAQ Section */}
                <CCard className="mb-4 mt-4">
                  <CCardHeader>
                    <h5 className="mb-0">FAQ (Frequently Asked Questions)</h5>
                  </CCardHeader>
                  <CCardBody>
                    {/* Add New FAQ */}
                    <CRow className="g-3 mb-4">
                      <CCol md={5}>
                        <CFormLabel>Question</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Enter question"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={5}>
                        <CFormLabel>Answer</CFormLabel>
                        <CFormInput
                          type="text"
                          placeholder="Enter answer"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        />
                      </CCol>
                      <CCol md={2} className="d-flex align-items-end">
                        <CButton 
                          color="primary" 
                          onClick={handleAddFaq} 
                          disabled={!newFaq.question || !newFaq.answer}
                        >
                          <FaPlus className="me-1" /> Add FAQ
                        </CButton>
                      </CCol>
                    </CRow>

                    {/* Existing FAQs */}
                    {formData.faq.length === 0 ? (
                      <div className="text-center py-3 text-muted">
                        No FAQs added yet. Use the form above to add frequently asked questions.
                      </div>
                    ) : (
                      formData.faq.map((faq, index) => (
                        <CCard key={index} className="mb-3">
                          <CCardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="mb-1">FAQ #{index + 1}</h6>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveFaq(index)}
                              >
                                <FaTrash />
                              </CButton>
                            </div>

                            <div className="mb-3">
                              <CFormLabel>Question</CFormLabel>
                              <CFormInput
                                type="text"
                                value={faq.question || ""}
                                onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                                placeholder="Question"
                              />
                            </div>

                            <div>
                              <CFormLabel>Answer</CFormLabel>
                              <CFormTextarea
                                rows={3}
                                value={faq.answer || ""}
                                onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                                placeholder="Answer"
                              />
                            </div>
                          </CCardBody>
                        </CCard>
                      ))
                    )}
                  </CCardBody>
                </CCard>

                {/* VISA DETAILS SECTION */}
                <CCard className="mb-4 mt-4">
                  <CCardHeader>
                    <h5 className="mb-0">
                      {/* <CIcon icon={cilDocument} className="me-2" /> */}
                      Visa Details
                    </h5>
                  </CCardHeader>
                  <CCardBody>
                    <CAccordion alwaysOpen>
                      {/* Basic Information */}
                      <CAccordionItem itemKey={1}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilInfo} className="me-2" />
                          Basic Information
                        </CAccordionHeader>
                        <CAccordionBody>
                          <CRow className="g-3">
                            <CCol md={6}>
                              <CFormLabel>Source Country ISO <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="text"
                                maxLength="3"
                                className="text-uppercase"
                                placeholder="e.g., USA, IND"
                                value={formData.visa_details.type.source_country_iso}
                                onChange={(e) => handleVisaDetailsChange('type.source_country_iso', e.target.value.toUpperCase())}
                                required
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Destination Country ISO <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="text"
                                maxLength="3"
                                className="text-uppercase"
                                placeholder="e.g., USA, IND"
                                value={formData.visa_details.type.destination_country_iso}
                                onChange={(e) => handleVisaDetailsChange('type.destination_country_iso', e.target.value.toUpperCase())}
                                required
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Visa Type <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="text"
                                placeholder="e.g., Tourist, Business, Student"
                                value={formData.visa_details.type.visa_type}
                                onChange={(e) => handleVisaDetailsChange('type.visa_type', e.target.value)}
                                required
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Title</CFormLabel>
                              <CFormInput
                                type="text"
                                placeholder="Display title for this visa"
                                value={formData.visa_details.type.title}
                                onChange={(e) => handleVisaDetailsChange('type.title', e.target.value)}
                              />
                            </CCol>
                            <CCol md={12}>
                              <CFormLabel>Description</CFormLabel>
                              <CFormTextarea
                                rows={3}
                                placeholder="Detailed description of the visa"
                                value={formData.visa_details.type.description}
                                onChange={(e) => handleVisaDetailsChange('type.description', e.target.value)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Last Updated <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="date"
                                value={formData.visa_details.type.last_updated}
                                onChange={(e) => handleVisaDetailsChange('type.last_updated', e.target.value)}
                                required
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Visa Details Status</CFormLabel>
                              <CFormSelect
                                value={formData.visa_details.type.status}
                                onChange={(e) => handleVisaDetailsChange('type.status', e.target.value)}
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </CFormSelect>
                            </CCol>
                          </CRow>
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Entry Classification */}
                      <CAccordionItem itemKey={2}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilList} className="me-2" />
                          Entry Classification
                        </CAccordionHeader>
                        <CAccordionBody>
                          <CRow className="g-3">
                            <CCol md={6}>
                              <CFormLabel>Entry Type <span className="text-danger">*</span></CFormLabel>
                              <CFormSelect
                                value={formData.visa_details.type.entry_classification.type}
                                onChange={(e) => handleVisaDetailsChange('type.entry_classification.type', e.target.value)}
                              >
                                <option value="Visa Required">Visa Required</option>
                                <option value="eVisa">eVisa</option>
                                <option value="Visa on Arrival">Visa on Arrival</option>
                                <option value="Visa Free">Visa Free</option>
                              </CFormSelect>
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Visa Category</CFormLabel>
                              <CFormInput
                                type="text"
                                placeholder="e.g., Short-term, Long-term"
                                value={formData.visa_details.type.entry_classification.visa_category}
                                onChange={(e) => handleVisaDetailsChange('type.entry_classification.visa_category', e.target.value)}
                              />
                            </CCol>
                            <CCol md={12}>
                              <CFormCheck
                                id="interview-mandatory"
                                label="Interview Mandatory"
                                checked={formData.visa_details.type.entry_classification.is_interview_mandatory}
                                onChange={(e) => handleVisaDetailsChange('type.entry_classification.is_interview_mandatory', e.target.checked)}
                              />
                            </CCol>
                          </CRow>
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Validity Rules */}
                      <CAccordionItem itemKey={3}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilCalendar} className="me-2" />
                          Validity Rules
                        </CAccordionHeader>
                        <CAccordionBody>
                          <CRow className="g-3">
                            <CCol md={6}>
                              <CFormLabel>Passport Validity Required (months) <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="number"
                                min="0"
                                value={formData.visa_details.type.validity_rules.passport_validity_months_required}
                                onChange={(e) => handleVisaDetailsChange('type.validity_rules.passport_validity_months_required', parseInt(e.target.value) || 0)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Blank Pages Required <span className="text-danger">*</span></CFormLabel>
                              <CFormInput
                                type="number"
                                min="0"
                                value={formData.visa_details.type.validity_rules.blank_pages_required}
                                onChange={(e) => handleVisaDetailsChange('type.validity_rules.blank_pages_required', parseInt(e.target.value) || 0)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Visa Validity (days)</CFormLabel>
                              <CFormInput
                                type="number"
                                placeholder="Leave empty if not applicable"
                                value={formData.visa_details.type.validity_rules.visa_validity_days || ''}
                                onChange={(e) => handleVisaDetailsChange('type.validity_rules.visa_validity_days', e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Max Stay Duration (days)</CFormLabel>
                              <CFormInput
                                type="number"
                                placeholder="Leave empty if not applicable"
                                value={formData.visa_details.type.validity_rules.max_stay_duration_days || ''}
                                onChange={(e) => handleVisaDetailsChange('type.validity_rules.max_stay_duration_days', e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </CCol>
                            <CCol md={12}>
                              <CFormCheck
                                id="multiple-entry"
                                label="Multiple Entry Allowed"
                                checked={formData.visa_details.type.validity_rules.multiple_entry_allowed}
                                onChange={(e) => handleVisaDetailsChange('type.validity_rules.multiple_entry_allowed', e.target.checked)}
                              />
                            </CCol>
                          </CRow>
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Visa Fees */}
                      <CAccordionItem itemKey={4}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilMoney} className="me-2" />
                          Visa Fees
                        </CAccordionHeader>
                        <CAccordionBody>
                          {/* Add New Fee */}
                          <CRow className="g-3 mb-4">
                            <CCol md={3}>
                              <CFormLabel>Fee Type</CFormLabel>
                              <CFormInput
                                type="text"
                                placeholder="e.g., Application, Processing"
                                value={newFee.type}
                                onChange={(e) => setNewFee(prev => ({ ...prev, type: e.target.value }))}
                              />
                            </CCol>
                            <CCol md={2}>
                              <CFormLabel>Amount</CFormLabel>
                              <CFormInput
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Amount"
                                value={newFee.amount}
                                onChange={(e) => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
                              />
                            </CCol>
                            <CCol md={2}>
                              <CFormLabel>Currency</CFormLabel>
                              <CFormInput
                                type="text"
                                maxLength="3"
                                className="text-uppercase"
                                placeholder="USD"
                                value={newFee.currency}
                                onChange={(e) => setNewFee(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                              />
                            </CCol>
                            <CCol md={2}>
                              <CFormLabel>Refundable?</CFormLabel>
                              <CFormCheck
                                id="fee-refundable"
                                label="Refundable"
                                checked={newFee.is_refundable}
                                onChange={(e) => setNewFee(prev => ({ ...prev, is_refundable: e.target.checked }))}
                              />
                            </CCol>
                            <CCol md={2}>
                              <CFormLabel>Notes</CFormLabel>
                              <CFormInput
                                type="text"
                                placeholder="Notes"
                                value={newFee.notes}
                                onChange={(e) => setNewFee(prev => ({ ...prev, notes: e.target.value }))}
                              />
                            </CCol>
                            <CCol md={1} className="d-flex align-items-end">
                              <CButton 
                                color="primary" 
                                onClick={handleAddFee} 
                                disabled={!newFee.type || !newFee.amount}
                              >
                                <FaPlus />
                              </CButton>
                            </CCol>
                          </CRow>

                          {/* Existing Fees */}
                          {formData.visa_details.type.fees.length === 0 ? (
                            <div className="text-center py-3 text-muted">
                              No fees added yet.
                            </div>
                          ) : (
                            formData.visa_details.type.fees.map((fee, index) => (
                              <CCard key={index} className="mb-2">
                                <CCardBody>
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <CRow className="g-2">
                                        <CCol md={3}>
                                          <CFormInput
                                            size="sm"
                                            value={fee.type}
                                            onChange={(e) => handleUpdateFee(index, 'type', e.target.value)}
                                            placeholder="Type"
                                          />
                                        </CCol>
                                        <CCol md={2}>
                                          <CFormInput
                                            size="sm"
                                            type="number"
                                            value={fee.amount}
                                            onChange={(e) => handleUpdateFee(index, 'amount', e.target.value)}
                                            placeholder="Amount"
                                          />
                                        </CCol>
                                        <CCol md={2}>
                                          <CFormInput
                                            size="sm"
                                            value={fee.currency}
                                            onChange={(e) => handleUpdateFee(index, 'currency', e.target.value.toUpperCase())}
                                            placeholder="Currency"
                                          />
                                        </CCol>
                                        <CCol md={2}>
                                          <CFormCheck
                                            id={`refundable-${index}`}
                                            label="Refundable"
                                            checked={fee.is_refundable}
                                            onChange={(e) => handleUpdateFee(index, 'is_refundable', e.target.checked)}
                                          />
                                        </CCol>
                                        <CCol md={3}>
                                          <CFormInput
                                            size="sm"
                                            value={fee.notes || ''}
                                            onChange={(e) => handleUpdateFee(index, 'notes', e.target.value)}
                                            placeholder="Notes"
                                          />
                                        </CCol>
                                      </CRow>
                                    </div>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      onClick={() => handleRemoveFee(index)}
                                      className="ms-2"
                                    >
                                      <FaTrash />
                                    </CButton>
                                  </div>
                                </CCardBody>
                              </CCard>
                            ))
                          )}
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Required Documents */}
                      <CAccordionItem itemKey={5}>
                        <CAccordionHeader className="bg-light">
                          {/* <CIcon icon={cilDocument} className="me-2" /> */}
                          Required Documents
                        </CAccordionHeader>
                        <CAccordionBody>
                          {/* Mandatory Documents */}
                          <div className="mb-4">
                            <h6>Mandatory Documents</h6>
                            <div className="d-flex gap-2 mb-2">
                              <CFormInput
                                type="text"
                                placeholder="Enter document name"
                                value={newMandatoryDocument}
                                onChange={(e) => setNewMandatoryDocument(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddMandatoryDocument()}
                              />
                              <CButton color="primary" onClick={handleAddMandatoryDocument} size="sm">
                                <FaPlus /> Add
                              </CButton>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {formData.visa_details.type.required_documents.mandatory.map((doc, idx) => (
                                <CBadge key={idx} color="info" className="p-2">
                                  {doc}
                                  <FaTimes 
                                    className="ms-2" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleRemoveMandatoryDocument(idx)}
                                  />
                                </CBadge>
                              ))}
                            </div>
                          </div>

                          {/* Supporting Documents */}
                          <div className="mb-4">
                            <h6>Supporting Documents</h6>
                            <div className="d-flex gap-2 mb-2">
                              <CFormInput
                                type="text"
                                placeholder="Enter document name"
                                value={newSupportingDocument}
                                onChange={(e) => setNewSupportingDocument(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSupportingDocument()}
                              />
                              <CButton color="primary" onClick={handleAddSupportingDocument} size="sm">
                                <FaPlus /> Add
                              </CButton>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {formData.visa_details.type.required_documents.supporting.map((doc, idx) => (
                                <CBadge key={idx} color="secondary" className="p-2">
                                  {doc}
                                  <FaTimes 
                                    className="ms-2" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleRemoveSupportingDocument(idx)}
                                  />
                                </CBadge>
                              ))}
                            </div>
                          </div>

                          {/* Financial Proof */}
                          <div className="mb-4">
                            <h6>Financial Proof Requirements</h6>
                            <CRow className="g-2">
                              <CCol md={4}>
                                <CFormLabel className="small">Bank Statement (months)</CFormLabel>
                                <CFormInput
                                  type="number"
                                  min="0"
                                  value={formData.visa_details.type.required_documents.financial_proof.bank_statement_months}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.financial_proof.bank_statement_months', parseInt(e.target.value) || 0)}
                                />
                              </CCol>
                              {/* <CCol md={4}>
                                <CFormLabel className="small">Tax Returns (years)</CFormLabel>
                                <CFormInput
                                  type="number"
                                  min="0"
                                  value={formData.visa_details.type.required_documents.financial_proof.tax_returns_years}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.financial_proof.tax_returns_years', parseInt(e.target.value) || 0)}
                                />
                              </CCol> */}
                              <CCol md={4}>
                                <CFormLabel className="small">Min Liquid Balance</CFormLabel>
                                <CFormInput
                                  type="number"
                                  placeholder="Leave empty if not applicable"
                                  value={formData.visa_details.type.required_documents.financial_proof.min_liquid_balance || ''}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.financial_proof.min_liquid_balance', e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </CCol>
                              {/* <CCol md={6}>
                                <CFormCheck
                                  id="blocked-account"
                                  label="Blocked Account Required"
                                  checked={formData.visa_details.type.required_documents.financial_proof.blocked_account_required}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.financial_proof.blocked_account_required', e.target.checked)}
                                />
                              </CCol>
                              <CCol md={6}>
                                <CFormCheck
                                  id="sponsor-allowed"
                                  label="Sponsor Allowed"
                                  checked={formData.visa_details.type.required_documents.financial_proof.sponsor_allowed}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.financial_proof.sponsor_allowed', e.target.checked)}
                                />
                              </CCol> */}
                            </CRow>
                          </div>

                          {/* Photo Specifications */}
                          {/* <div>
                            <h6>Photo Specifications</h6>
                            <CRow className="g-2">
                              <CCol md={4}>
                                <CFormLabel className="small">Dimensions</CFormLabel>
                                <CFormInput
                                  type="text"
                                  placeholder="e.g., 35mm x 45mm"
                                  value={formData.visa_details.type.required_documents.photo_specifications.dimensions}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.photo_specifications.dimensions', e.target.value)}
                                />
                              </CCol>
                              <CCol md={4}>
                                <CFormLabel className="small">Background Color</CFormLabel>
                                <CFormInput
                                  type="text"
                                  placeholder="e.g., White, Light Gray"
                                  value={formData.visa_details.type.required_documents.photo_specifications.background_color}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.photo_specifications.background_color', e.target.value)}
                                />
                              </CCol>
                              <CCol md={4}>
                                <CFormLabel className="small">Physical Copies Required</CFormLabel>
                                <CFormInput
                                  type="number"
                                  min="0"
                                  value={formData.visa_details.type.required_documents.photo_specifications.physical_copies_required}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.photo_specifications.physical_copies_required', parseInt(e.target.value) || 0)}
                                />
                              </CCol>
                              <CCol md={4}>
                                <CFormCheck
                                  id="digital-required"
                                  label="Digital Photo Required"
                                  checked={formData.visa_details.type.required_documents.photo_specifications.digital_required}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.photo_specifications.digital_required', e.target.checked)}
                                />
                              </CCol>
                              <CCol md={4}>
                                <CFormCheck
                                  id="biometric-required-photo"
                                  label="Biometric Required"
                                  checked={formData.visa_details.type.required_documents.photo_specifications.biometric_required}
                                  onChange={(e) => handleVisaDetailsChange('type.required_documents.photo_specifications.biometric_required', e.target.checked)}
                                />
                              </CCol>
                            </CRow>
                          </div> */}
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Process Steps */}
                      <CAccordionItem itemKey={6}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilList} className="me-2" />
                          Process Steps
                        </CAccordionHeader>
                        <CAccordionBody>
                          {/* Add New Step */}
                          <CCard className="mb-4">
                            <CCardBody>
                              <h6>Add New Process Step</h6>
                              <CRow className="g-3">
                                <CCol md={6}>
                                  <CFormLabel>Step Title</CFormLabel>
                                  <CFormInput
                                    placeholder="e.g., Submit Application"
                                    value={newProcessStep.title}
                                    onChange={(e) => setNewProcessStep(prev => ({ ...prev, title: e.target.value }))}
                                  />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>Action</CFormLabel>
                                  <CFormInput
                                    placeholder="e.g., Fill online form"
                                    value={newProcessStep.action}
                                    onChange={(e) => setNewProcessStep(prev => ({ ...prev, action: e.target.value }))}
                                  />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>Location</CFormLabel>
                                  <CFormInput
                                    placeholder="e.g., Online, Embassy"
                                    value={newProcessStep.location}
                                    onChange={(e) => setNewProcessStep(prev => ({ ...prev, location: e.target.value }))}
                                  />
                                </CCol>
                                <CCol md={6}>
                                  <CFormLabel>Estimated Duration (days)</CFormLabel>
                                  <CFormInput
                                    type="number"
                                    placeholder="Optional"
                                    value={newProcessStep.estimated_duration_days || ''}
                                    onChange={(e) => setNewProcessStep(prev => ({ ...prev, estimated_duration_days: e.target.value ? parseInt(e.target.value) : null }))}
                                  />
                                </CCol>
                                <CCol md={12}>
                                  <CFormLabel>Description</CFormLabel>
                                  <CFormTextarea
                                    rows={2}
                                    placeholder="Step description"
                                    value={newProcessStep.description}
                                    onChange={(e) => setNewProcessStep(prev => ({ ...prev, description: e.target.value }))}
                                  />
                                </CCol>
                                <CCol md={12}>
                                  <CButton 
                                    color="primary" 
                                    onClick={handleAddProcessStep} 
                                    disabled={!newProcessStep.title || !newProcessStep.action || !newProcessStep.location}
                                  >
                                    <FaPlus className="me-1" /> Add Step
                                  </CButton>
                                </CCol>
                              </CRow>
                            </CCardBody>
                          </CCard>

                          {/* Existing Steps */}
                          {formData.visa_details.type.process_steps.map((step, index) => (
                            <CCard key={index} className="mb-3">
                              <CCardBody>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <h6 className="mb-0">Step {step.step_number}: {step.title}</h6>
                                  <div className="d-flex gap-2">
                                    <CButton
                                      color="secondary"
                                      size="sm"
                                      onClick={() => handleMoveProcessStepUp(index)}
                                      disabled={index === 0}
                                    >
                                      <FaArrowUp />
                                    </CButton>
                                    <CButton
                                      color="secondary"
                                      size="sm"
                                      onClick={() => handleMoveProcessStepDown(index)}
                                      disabled={index === formData.visa_details.type.process_steps.length - 1}
                                    >
                                      <FaArrowDown />
                                    </CButton>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      onClick={() => handleRemoveProcessStep(index)}
                                    >
                                      <FaTrash />
                                    </CButton>
                                  </div>
                                </div>
                                <CRow className="g-2">
                                  <CCol md={6}>
                                    <CFormLabel className="small">Title</CFormLabel>
                                    <CFormInput
                                      size="sm"
                                      value={step.title}
                                      onChange={(e) => handleUpdateProcessStep(index, 'title', e.target.value)}
                                    />
                                  </CCol>
                                  <CCol md={6}>
                                    <CFormLabel className="small">Action</CFormLabel>
                                    <CFormInput
                                      size="sm"
                                      value={step.action}
                                      onChange={(e) => handleUpdateProcessStep(index, 'action', e.target.value)}
                                    />
                                  </CCol>
                                  <CCol md={6}>
                                    <CFormLabel className="small">Location</CFormLabel>
                                    <CFormInput
                                      size="sm"
                                      value={step.location}
                                      onChange={(e) => handleUpdateProcessStep(index, 'location', e.target.value)}
                                    />
                                  </CCol>
                                  <CCol md={6}>
                                    <CFormLabel className="small">Est. Duration (days)</CFormLabel>
                                    <CFormInput
                                      size="sm"
                                      type="number"
                                      value={step.estimated_duration_days || ''}
                                      onChange={(e) => handleUpdateProcessStep(index, 'estimated_duration_days', e.target.value ? parseInt(e.target.value) : null)}
                                    />
                                  </CCol>
                                  <CCol md={12}>
                                    <CFormLabel className="small">Description</CFormLabel>
                                    <CFormTextarea
                                      rows={2}
                                      size="sm"
                                      value={step.description || ''}
                                      onChange={(e) => handleUpdateProcessStep(index, 'description', e.target.value)}
                                    />
                                  </CCol>
                                </CRow>
                              </CCardBody>
                            </CCard>
                          ))}
                        </CAccordionBody>
                      </CAccordionItem>

                      {/* Additional Requirements */}
                      <CAccordionItem itemKey={7}>
                        <CAccordionHeader className="bg-light">
                          <CIcon icon={cilCheckCircle} className="me-2" />
                          Additional Requirements
                        </CAccordionHeader>
                        <CAccordionBody>
                          <CRow className="g-3">
                            {/* <CCol md={6}>
                              <CFormCheck
                                id="biometrics-required"
                                label="Biometrics Required"
                                checked={formData.visa_details.type.biometrics_required}
                                onChange={(e) => handleVisaDetailsChange('type.biometrics_required', e.target.checked)}
                              />
                            </CCol> */}
                            <CCol md={6}>
                              <CFormCheck
                                id="medical-insurance"
                                label="Medical Insurance Required"
                                checked={formData.visa_details.type.medical_insurance_required}
                                onChange={(e) => handleVisaDetailsChange('type.medical_insurance_required', e.target.checked)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormCheck
                                id="aps-certificate"
                                label="APS Certificate Required"
                                checked={formData.visa_details.type.aps_certificate_required}
                                onChange={(e) => handleVisaDetailsChange('type.aps_certificate_required', e.target.checked)}
                              />
                            </CCol>
                            <CCol md={6}>
                              <CFormLabel>Average Processing Time (days)</CFormLabel>
                              <CFormInput
                                type="number"
                                min="0"
                                value={formData.visa_details.type.average_processing_time_days}
                                onChange={(e) => handleVisaDetailsChange('type.average_processing_time_days', parseInt(e.target.value) || 0)}
                              />
                            </CCol>
                          </CRow>
                        </CAccordionBody>
                      </CAccordionItem>
                    </CAccordion>
                  </CCardBody>
                </CCard>
              </CModalBody>
              <CModalFooter className="bg-light">
                <CButton 
                  color="secondary" 
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                    setFormData({ 
                      name: '', 
                      code: '', 
                      currency: '', 
                      status: 'Active', 
                      isFeatured: 'No',
                      flg: '',
                      sections: [],
                      extraStatus: 'Active',
                      faq: [],
                      visa_details: {
                        type: {
                    source_country_iso: '',
                    destination_country_iso: '',
                    visa_type: '',
                    title: '',
                    description: '',
                    last_updated: new Date().toISOString().split('T')[0],
                    entry_classification: {
                      type: 'Visa Required',
                      is_interview_mandatory: false,
                      visa_category: ''
                    },
                    validity_rules: {
                      passport_validity_months_required: 0,
                      blank_pages_required: 0,
                      visa_validity_days: null,
                      max_stay_duration_days: null,
                      multiple_entry_allowed: false
                    },
                    fees: [],
                    required_documents: {
                      mandatory: [],
                      supporting: [],
                      financial_proof: {
                        bank_statement_months: 0,
                        // tax_returns_years: 0,
                        min_liquid_balance: null,
                        // blocked_account_required: false,
                        // sponsor_allowed: false
                      },
                      // photo_specifications: {
                      //   dimensions: '',
                      //   background_color: '',
                      //   digital_required: false,
                      //   physical_copies_required: 0,
                      //   biometric_required: false
                      // }
                    },
                    process_steps: [],
                    // biometrics_required: false,
                    medical_insurance_required: false,
                    aps_certificate_required: false,
                    average_processing_time_days: 0,
                    other: {},
                    status: 'published'
                  }
                      }
                    })
                    setImagePreview('')
                    setError('')
                  }}
                  className="px-4"
                >
                  Cancel
                </CButton>
                <CButton 
                  type="submit" 
                  color="primary"
                  disabled={uploadingImage}
                  className="px-4"
                >
                  {uploadingImage ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : editingId ? 'Update Country' : 'Create Country'}
                </CButton>
              </CModalFooter>
            </CForm>
          </CModal>

          {/* DELETE MODAL */}
          <CModal 
            visible={showDeleteModal} 
            onClose={() => setShowDeleteModal(false)}
            alignment="center"
          >
            <CModalHeader closeButton>
              <CModalTitle className="text-danger">
                <CIcon icon={cilTrash} className="me-2" />
                Confirm Deletion
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="text-center py-4">
              <CIcon icon={cilFlagAlt} size="3xl" className="text-danger mb-3" />
              <h5>Are you sure you want to delete this country?</h5>
              <p className="text-muted">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </CModalBody>
            <CModalFooter className="justify-content-center">
              <CButton 
                color="secondary" 
                onClick={() => setShowDeleteModal(false)}
                className="px-4"
              >
                Cancel
              </CButton>
              <CButton 
                color="danger" 
                onClick={handleDelete}
                className="px-4"
              >
                <CIcon icon={cilTrash} className="me-2" />
                Delete Country
              </CButton>
            </CModalFooter>
          </CModal>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Countries