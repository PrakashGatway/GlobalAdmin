


'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CInputGroup,
} from '@coreui/react'
import '@coreui/coreui/dist/css/coreui.min.css'
import toast from 'react-hot-toast'
import CKEditorComponent from '../page-information/Ckeditor'
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa'
import apiService from '../../services/apiService'
import Select from 'react-select'


// ==================== TEMPLATE DEFINITIONS ====================
const TEMPLATES = {
  intro: {
    name: 'Introduction',
    fields: {
      title: { type: 'text', label: 'Title', placeholder: 'Enter section title' },
      content: { type: 'editor', label: 'Content', placeholder: 'Write your content here...' },
      cards: { 
        type: 'array',
        label: 'Cards',
        fields: {
          title: { type: 'text', label: 'Card Title', placeholder: 'Enter card title' },
          description: { type: 'textarea', label: 'Description', placeholder: 'Enter card description' },
          icon: { type: 'text', label: 'Icon', placeholder: 'Icon class or URL' }
        }
      }
    }
  },
  cta: {
    name: 'Call to Action',
    fields: {
      title: { type: 'text', label: 'Title', placeholder: 'Enter CTA title' },
      subtitle: { type: 'textarea', label: 'Subtitle', placeholder: 'Enter CTA subtitle' },
      img: { type: 'text', label: 'Image URL', placeholder: 'https://example.com/image.jpg' }
    }
  },
  topProgram: {
    name: 'Top Program',
    fields: {
      title: { type: 'text', label: 'Title', placeholder: 'Enter program section title' },
      subtitle: { type: 'textarea', label: 'Subtitle', placeholder: 'Enter program subtitle' },
      data: {
        type: 'array',
        label: 'Programs',
        fields: {
          title: { type: 'text', label: 'Program Title', placeholder: 'Enter program name' },
          subtitle: { type: 'textarea', label: 'Program Subtitle', placeholder: 'Enter program description' }
        }
      }
    }
  },
  otherdata: {
    name: 'Other Data',
    fields: {
      title: { type: 'text', label: 'Title', placeholder: 'Enter section title' },
      data: {
        type: 'array',
        label: 'Data Items',
        fields: {
          title: { type: 'text', label: 'Item Title', placeholder: 'Enter item title' },
          content: { type: 'editor', label: 'Content', placeholder: 'Write your content here...' }
        }
      }
    }
  }
}

// ==================== MAIN COMPONENT ====================


export default function CourseManagement() {
  const [view, setView] = useState('list')
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [courses, setCourses] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('intro')
  const [sectionName, setSectionName] = useState('')
  const [newtop, setNewtop] = useState('')
  const [formData, setFormData] = useState({
    topcourse: [],
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      slug: '',
      coverImage: '',
      uniSlug: '',
      tutionFees: '',
      applicationFees: '',
      shortName: '',
      tags: [],
      status: 'draft',
      level: '',
      duration: '',
      mode: '',
      content: {
        sections: []
      },
      
      faqSection: {
        title: '',
        subtitle: '',
        items: [{ question: '', answer: '' }]
      },
      
      roadmap: {
        title: '',
        subtitle: '',
        steps: [{ step: '', title: '', description: '', icon: '' }]
      },
      simillarCourses: [{ title: '', description: '' }],
      ctaSection: [{ title: '', description: '' }],
      seoInfo: { 
        metaTitle: '', 
        metaDescription: '', 
        metaKeywords: '' 
      }
    }
  })

  
  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: 'content.sections'
  })

  
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faqSection.items'
  })

  const { fields: destinationFields, append: appendDestination, remove: removeDestination } = useFieldArray({
    control,
    name: 'relatedDestination.items'
  })

  const { fields: roadmapFields, append: appendRoadmap, remove: removeRoadmap } = useFieldArray({
    control,
    name: 'roadmap.steps'
  })

  const { fields: simillarFields, append: appendSimillar, remove: removeSimillar } = useFieldArray({
    control,
    name: 'simillarCourses'
  })

  const { fields: ctaFields, append: appendCta, remove: removeCta } = useFieldArray({
    control,
    name: 'ctaSection'
  })

  const onSubmit = async (data) => {
    try {
      const finalData = {
        ...data,
        topcourse: formData.topcourse || [],
      }

      const url = editingId
        ? `http://localhost:4000/courses/${editingId}`
        : 'http://localhost:4000/courses/'

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} course`)
      }

      const result = await response.json()

      setView('list')
      reset()
      setEditingId(null)
      setFormData({ topcourse: [] })
      toast.success(`Course ${editingId ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Something went wrong!')
    }
  }

const [search, setSearch] = useState("");
const [uniData, setUniData] = useState([]);
const [selectedUni, setSelectedUni] = useState(null);

async function university(searchValue = "") {
  try {
    const api = await apiService.get(
      `/universities?page=1&limit=8&sort_by=name&name=${encodeURIComponent(
        searchValue
      )}`
    );

    console.log(api.result || []);
    setUniData(api.result || []);
  } catch (error) {
    console.error("University error", error);
    setUniData([]);
  }
}

useEffect(() => {
  university("");
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    university(search);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);
  

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:4000/courses/')
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        // console.log(data, "courses ...")
        setCourses(data.courses || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    fetchCourses()
  }, [])

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/courses/${id}`)
      const result = await response.json()
      const course = result.data

      setEditingId(course._id)
      
      if (course.topcourse) {
        setFormData(prev => ({
          ...prev,
          topcourse: course.topcourse
        }))
      }

      reset(course)
      setActiveTab('basic')
      setView('form')
    } catch (err) {
      console.log(err)
      toast.error('Failed to load course data')
    }
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setFormData({ topcourse: [] })
    reset({
      title: '',
      description: '',
      slug: '',
      coverImage: '',
      uniSlug: '',
      tutionFees: '',
      applicationFees: '',
      shortName: '',
      tags: [],
      status: 'draft',
      level: '',
      duration: '',
      mode: '',
      content: {
        sections: []
      },
      faqSection: {
        title: '',
        subtitle: '',
        items: [{ question: '', answer: '' }]
      },
      relatedDestination: {
        title: '',
        subtitle: '',
        items: [{ name: '', description: '', image: '', link: '' }]
      },
      roadmap: {
        title: '',
        subtitle: '',
        steps: [{ step: '', title: '', description: '', icon: '' }]
      },
      simillarCourses: [{ title: '', description: '' }],
      ctaSection: [{ title: '', description: '' }],
      seoInfo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
      },
    })
    setActiveTab('basic')
    setView('form')
  }

  const handleCancel = () => {
    setView('list')
    reset()
    setEditingId(null)
    setFormData({ topcourse: [] })
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/courses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete course')
      }
      setCourses(courses.filter((course) => course._id !== id))
      toast.success('Course deleted successfully!')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course.')
    }
  }

  const handleAddtop = () => {
    if (newtop.trim()) {
      setFormData(prev => ({
        ...prev,
        topcourse: [...(prev.topcourse || []), newtop.trim()]
      }))
      setNewtop('')
    }
  }

  const handleRemovetop = (index) => {
    setFormData(prev => ({
      ...prev,
      topcourse: (prev.topcourse || []).filter((_, i) => i !== index)
    }))
  }

  const handleUpdatetop = (index, value) => {
    setFormData(prev => ({
      ...prev,
      topcourse: (prev.topcourse || []).map((item, i) => i === index ? value : item)
    }))
  }

  // Add new section with selected template
  const addNewSection = () => {
    const template = TEMPLATES[selectedTemplate]
    if (!template) return

    // Create default data structure based on template
    const defaultData = {}
    Object.keys(template.fields).forEach(fieldName => {
      const field = template.fields[fieldName]
      if (field.type === 'array') {
        const defaultItem = {}
        Object.keys(field.fields).forEach(subFieldName => {
          defaultItem[subFieldName] = ''
        })
        defaultData[fieldName] = [defaultItem]
      } else if (field.type === 'editor') {
        defaultData[fieldName] = ''
      } else {
        defaultData[fieldName] = ''
      }
    })

    appendSection({
      id: Date.now(),
      type: selectedTemplate,
      name: sectionName || template.name,
      order: sectionFields.length + 1,
      data: defaultData
    })

    setSectionName('')
  }

  const moveSectionUp = (index) => {
    if (index > 0) {
      moveSection(index, index - 1)
    }
  }

  const moveSectionDown = (index) => {
    if (index < sectionFields.length - 1) {
      moveSection(index, index + 1)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'seo', label: 'SEO' },
    { id: 'content', label: 'Content Details' },
    { id: 'sections', label: 'Other Sections' },
  ]



  // ==================== LIST VIEW ====================
  if (view === 'list') {
    return (
      <div className="p-4">
        <CCard className="shadow-sm">
          <CCardHeader className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="m-0 fw-semibold text-dark">All Courses</h4>
              <small className="text-medium-emphasis">
                Manage and organize all university courses
              </small>
            </div>
            <CButton color="primary" onClick={handleCreateNew} className="px-4">
              <span className="me-2">+</span> Create New Course
            </CButton>

          </CCardHeader>
          <CCardBody className="p-0">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap bg-light">
                <CTableRow>
                  <CTableHeaderCell className="text-center px-4 py-3 fw-semibold">
                    Course Title
                  </CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">University</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Level</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Status</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Updated</CTableHeaderCell>
                  <CTableHeaderCell className="text-center px-4 py-3 fw-semibold">
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {courses.map((course) => (
                  <CTableRow key={course._id} className="border-bottom">
                    <CTableDataCell className="px-4 py-3">
                      <div className="fw-semibold text-dark">{course.title}</div>
                      <small className="text-medium-emphasis d-block">{course.slug}</small>
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-capitalize">
                      {course.uniSlug?.replace(/-/g, ' ')}
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3">{course.level}</CTableDataCell>
                    <CTableDataCell className="px-4 py-3">
                      <CBadge
                        color={course.status === 'published' ? 'success' : 'warning'}
                        shape="rounded-pill"
                      >
                        {course.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-medium-emphasis">
                      {course.updatedAt}
                    </CTableDataCell>
                    <CTableDataCell className="text-center px-4 py-3">
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(course.slug)}
                      >
                        Edit
                      </CButton>
                      <CButton
                        onClick={() => handleDelete(course._id)}
                        color="danger"
                        variant="outline"
                        size="sm"
                      >
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </div>
    )
  }

  // ==================== FORM VIEW ====================
  return (
    <div className="p-4">
      <CCard className="shadow-sm">
        <CCardHeader className="bg-white border-bottom px-4 py-3">
          <h4 className="m-0 fw-semibold text-dark">
            {editingId ? 'Edit Course' : 'Create New Course'}
          </h4>
          <small className="text-medium-emphasis">
            {editingId ? 'Update course information' : 'Fill in the details to add a new course'}
          </small>
        </CCardHeader>

        {/* Tabs */}
        <div className="px-4 pt-3 border-bottom bg-light-subtle">
          <CNav variant="tabs">
            {tabs.map((tab) => (
              <CNavItem key={tab.id}>
                <CNavLink
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {tab.label}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </div>

        <CCardBody className="p-4">
          <CForm onSubmit={handleSubmit(onSubmit)}>
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="title" className="fw-semibold">
                    Course Title <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    id="title"
                    placeholder="e.g., MBA in International Business"
                    invalid={!!errors.title}
                    {...register('title', { required: true })}
                  />
                  {errors.title && (
                    <div className="invalid-feedback d-block">Title is required</div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="shortName" className="fw-semibold">
                    Short Name
                  </CFormLabel>
                  <CFormInput
                    id="shortName"
                    placeholder="e.g., MBA IB"
                    {...register('shortName')}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="slug" className="fw-semibold">
                    URL Slug <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    id="slug"
                    placeholder="e.g., mba-international-business"
                    invalid={!!errors.slug}
                    {...register('slug', { required: true })}
                  />
                  {errors.slug && <div className="invalid-feedback d-block">Slug is required</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="uniSlug" className="fw-semibold">
                    University Slug <span className="text-danger">*</span>
                  </CFormLabel>
                  
                  {/* <CFormSelect id='uniSlug' invalid={!!errors.uniSlug}
                   {...register('uniSlug',{required: true})}
                   >
                    <option value="">Select Option</option>
                    {uniData.map((ele,idx) => (
                      <option value={ele.slug} key={idx}>{ele.name}</option>
                    ))}

                   </CFormSelect>
                  {errors.uniSlug && (
                    <div className="invalid-feedback d-block">University slug is required</div>
                  )} */}
                  

                  <Select
                    id="uniSlug"
                    placeholder="Search or select university..."
                    isSearchable
                    isClearable
                    defaultValue={(() => {
      const currentSlug = watch('uniSlug');
      if (currentSlug) {
        const found = uniData.find((ele) => ele.slug === currentSlug);
        if (found) {
          return {
            value: found.slug,
            label: found.name
          };
        }
      }
      return null;
    })()}
                    options={uniData.map((ele) => ({
                      value: ele.slug,
                      label: ele.name,
                    }))}
                    onInputChange={(value, actionMeta) => {
                      if (actionMeta.action === "input-change") {
                        setSearch(value);
                        university(value);
                      }

                      return value;
                    }}
                    onChange={(selectedOption) => {
                      setValue("uniSlug", selectedOption?.value || "", {
                        shouldValidate: true,
                      });
                    }}
                    className={errors.uniSlug ? "is-invalid" : "fw-semibold"}
                    classNamePrefix="university"
                  />

                  {errors.uniSlug && (
                    <div className="invalid-feedback d-block">
                      University slug is required
                    </div>
                  )}



                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="level" className="fw-semibold">
                    Level <span className="text-danger">*</span>
                  </CFormLabel>
                  
                  <Select
  id="uniSlug"
  placeholder="Search or select university..."
  isSearchable
  isClearable
  options={uniData.map((ele) => ({
    value: ele.slug,
    label: ele.name,
  }))}
  defaultValue={(() => {
    const currentSlug = watch('uniSlug');
    if (currentSlug) {
      const found = uniData.find((ele) => ele.slug === currentSlug);
      if (found) {
        return {
          value: found.slug,
          label: found.name
        };
      }
    }
    return null;
  })()}
  onInputChange={(value, actionMeta) => {
    if (actionMeta.action === "input-change") {
      setSearch(value);
      university(value);
    }
    return value;
  }}
  onChange={(selectedOption) => {
    setValue("uniSlug", selectedOption?.value || "", {
      shouldValidate: true,
    });
  }}
  className={errors.uniSlug ? "is-invalid" : ""}
  classNamePrefix="university"
/>

                  {errors.level && (
                    <div className="invalid-feedback d-block">Level is required</div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="duration" className="fw-semibold">
                    Duration
                  </CFormLabel>
                  <CFormInput
                    id="duration"
                    placeholder="e.g., 1 Year Full-time"
                    {...register('duration')}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="mode" className="fw-semibold">
                    Mode of Study
                  </CFormLabel>
                  <CFormSelect id="mode" {...register('mode')}>
                    <option value="">Select Mode</option>
                    <option value="Full Time">Full time</option>
                    <option value="Part Time">Part time</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="tutionFees" className="fw-semibold">
                    Tuition Fees
                  </CFormLabel>
                  <CFormInput
                    id="tutionFees"
                    placeholder="e.g., £22,500"
                    {...register('tutionFees')}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="applicationFees" className="fw-semibold">
                    Application Fees
                  </CFormLabel>
                  <CFormInput
                    id="applicationFees"
                    placeholder="e.g., £50"
                    {...register('applicationFees')}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="status" className="fw-semibold">
                    Status <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="status"
                    invalid={!!errors.status}
                    {...register('status', { required: true })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12}>
                  <CFormLabel htmlFor="coverImage" className="fw-semibold">
                    Cover Image URL
                  </CFormLabel>
                  <CFormInput
                    id="coverImage"
                    placeholder="https://example.com/image.jpg"
                    {...register('coverImage')}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel htmlFor="description" className="fw-semibold">
                    Description <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormTextarea
                    id="description"
                    rows={5}
                    placeholder="Enter detailed course description..."
                    invalid={!!errors.description}
                    {...register('description', { required: true })}
                  />
                  {errors.description && (
                    <div className="invalid-feedback d-block">Description is required</div>
                  )}
                </CCol>
              </CRow>
            )}

            {/* CONTENT TAB - Template based with section management */}
            {activeTab === 'content' && (
              <div>
                {/* Header with Template Selection */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Content Sections</h5>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <CFormLabel className="mb-0">Template:</CFormLabel>
                      <CFormSelect
                        style={{ width: '180px' }}
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                      >
                        {Object.keys(TEMPLATES).map((key) => (
                          <option key={key} value={key}>
                            {TEMPLATES[key].name}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <CFormLabel className="mb-0">Section Name:</CFormLabel>
                      <CFormInput
                        style={{ width: '150px' }}
                        placeholder="Custom name..."
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                      />
                    </div>
                    <CButton color="primary" onClick={addNewSection}>
                      <FaPlus className="me-1" /> Add Section
                    </CButton>
                  </div>
                </div>

                {/* Sections List */}
                {sectionFields.length === 0 ? (
                  <div className="text-center py-5 text-muted border rounded">
                    <p className="mb-0">No content sections added.</p>
                    <small>Select a template and click "Add Section" to create one.</small>
                  </div>
                ) : (
                  sectionFields.map((section, index) => {
                    const template = TEMPLATES[section.type]
                    if (!template) return null

                    return (
                      <CCard key={section.id} className="mb-3 border">
                        <CCardHeader className="bg-light d-flex justify-content-between align-items-center py-2">
                          <div className="d-flex align-items-center gap-3">
                            <FaGripVertical className="text-muted" style={{ cursor: 'move' }} />
                            <span className="fw-semibold">Order {section.order}</span>
                            <span className="text-muted">|</span>
                            <span>{section.name || template.name}</span>
                            <CBadge color="info" className="ms-2">
                              {template.name}
                            </CBadge>
                          </div>
                          <div className="d-flex gap-1">
                            <CButton
                              color="link"
                              size="sm"
                              className="text-decoration-none"
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                            >
                              ↑
                            </CButton>
                            <CButton
                              color="link"
                              size="sm"
                              className="text-decoration-none"
                              onClick={() => moveSectionDown(index)}
                              disabled={index === sectionFields.length - 1}
                            >
                              ↓
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSection(index)}
                            >
                              <FaTrash />
                            </CButton>
                          </div>
                        </CCardHeader>
                        <CCardBody>
                          {/* Dynamically render fields based on template */}
                          {Object.keys(template.fields).map((fieldName) => {
                            const field = template.fields[fieldName]
                            const fieldPath = `content.sections.${index}.data.${fieldName}`

                            if (field.type === 'array') {
                              return (
                                <DynamicArrayField
                                  key={fieldName}
                                  control={control}
                                  register={register}
                                  fieldName={fieldName}
                                  field={field}
                                  fieldPath={fieldPath}
                                  sectionIndex={index}
                                />
                              )
                            } else if (field.type === 'editor') {
                              return (
                                <div key={fieldName} className="mb-3">
                                  <CFormLabel className="fw-semibold">{field.label}</CFormLabel>
                                  <Controller
                                    name={fieldPath}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                      <CKEditorComponent
                                        value={controllerField.value || ''}
                                        onChange={controllerField.onChange}
                                      />
                                    )}
                                  />
                                </div>
                              )
                            } else if (field.type === 'textarea') {
                              return (
                                <div key={fieldName} className="mb-3">
                                  <CFormLabel className="fw-semibold">{field.label}</CFormLabel>
                                  <CFormTextarea
                                    rows={3}
                                    placeholder={field.placeholder}
                                    {...register(fieldPath)}
                                  />
                                </div>
                              )
                            } else {
                              return (
                                <div key={fieldName} className="mb-3">
                                  <CFormLabel className="fw-semibold">{field.label}</CFormLabel>
                                  <CFormInput
                                    placeholder={field.placeholder}
                                    {...register(fieldPath)}
                                  />
                                </div>
                              )
                            }
                          })}
                        </CCardBody>
                      </CCard>
                    )
                  })
                )}
              </div>
            )}

            {/* SECTIONS TAB - Updated with all sections */}
            {activeTab === 'sections' && (
              <CRow className="g-4">
                {/* Similar Courses Section */}
                <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5 className="mb-0">Similar Courses</h5>
                    </CCardHeader>
                    <CCardBody>
                      {simillarFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-light rounded mb-3">
                          <CRow className="g-3">
                            <CCol xs={12}>
                              <CFormLabel>Title</CFormLabel>
                              <CFormInput
                                placeholder="Course Title"
                                {...register(`simillarCourses.${index}.title`)}
                              />
                            </CCol>
                            <CCol xs={12}>
                              <CFormLabel>Description</CFormLabel>
                              <CFormTextarea
                                rows={2}
                                placeholder="Course Description"
                                {...register(`simillarCourses.${index}.description`)}
                              />
                            </CCol>
                          </CRow>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => removeSimillar(index)}
                          >
                            Remove
                          </CButton>
                        </div>
                      ))}
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => appendSimillar({ title: '', description: '' })}
                      >
                        + Add Similar Course
                      </CButton>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* F&Q Section */}
                <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5 className="mb-0">F&Q Section</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-3 mb-4">
                        <CCol xs={12}>
                          <CFormLabel>Section Title</CFormLabel>
                          <CFormInput
                            placeholder="e.g., Frequently Asked Questions"
                            {...register('faqSection.title')}
                          />
                        </CCol>
                        <CCol xs={12}>
                          <CFormLabel>Section Subtitle</CFormLabel>
                          <CFormTextarea
                            rows={2}
                            placeholder="Brief description for the FAQ section"
                            {...register('faqSection.subtitle')}
                          />
                        </CCol>
                      </CRow>
                      
                      <h6 className="mb-3">FAQ Items</h6>
                      {faqFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-light rounded mb-3">
                          <CRow className="g-3">
                            <CCol xs={12}>
                              <CFormLabel>Question</CFormLabel>
                              <CFormInput
                                placeholder="Enter question"
                                {...register(`faqSection.items.${index}.question`)}
                              />
                            </CCol>
                            <CCol xs={12}>
                              <CFormLabel>Answer</CFormLabel>
                              <Controller
                                name={`faqSection.items.${index}.answer`}
                                control={control}
                                render={({ field }) => (
                                  <CKEditorComponent
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </CCol>
                          </CRow>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => removeFaq(index)}
                          >
                            Remove FAQ
                          </CButton>
                        </div>
                      ))}
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => appendFaq({ question: '', answer: '' })}
                      >
                        + Add FAQ
                      </CButton>
                    </CCardBody>
                  </CCard>
                </CCol>



                {/* Roadmap Section */}
                <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5 className="mb-0">Roadmap Section</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-3 mb-4">
                        <CCol xs={12}>
                          <CFormLabel>Section Title</CFormLabel>
                          <CFormInput
                            placeholder="e.g., Your Study Journey"
                            {...register('roadmap.title')}
                          />
                        </CCol>
                        <CCol xs={12}>
                          <CFormLabel>Section Subtitle</CFormLabel>
                          <CFormTextarea
                            rows={2}
                            placeholder="Brief description of the roadmap"
                            {...register('roadmap.subtitle')}
                          />
                        </CCol>
                      </CRow>
                      
                      <h6 className="mb-3">Roadmap Steps</h6>
                      {roadmapFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-light rounded mb-3">
                          <CRow className="g-3">
                            <CCol xs={12}>
                              <CFormLabel>Step Number</CFormLabel>
                              <CFormInput
                                placeholder="e.g., 1, 2, 3..."
                                {...register(`roadmap.steps.${index}.step`)}
                              />
                            </CCol>
                            <CCol xs={12}>
                              <CFormLabel>Title</CFormLabel>
                              <CFormInput
                                placeholder="e.g., Choose Your Course"
                                {...register(`roadmap.steps.${index}.title`)}
                              />
                            </CCol>
                            <CCol xs={12}>
                              <CFormLabel>Description</CFormLabel>
                              <CFormTextarea
                                rows={2}
                                placeholder="Detailed description of this step"
                                {...register(`roadmap.steps.${index}.description`)}
                              />
                            </CCol>
                            <CCol xs={12}>
                              <CFormLabel>Icon</CFormLabel>
                              <CFormInput
                                placeholder="Icon class or URL"
                                {...register(`roadmap.steps.${index}.icon`)}
                              />
                            </CCol>
                          </CRow>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => removeRoadmap(index)}
                          >
                            Remove Step
                          </CButton>
                        </div>
                      ))}
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => appendRoadmap({ step: '', title: '', description: '', icon: '' })}
                      >
                        + Add Roadmap Step
                      </CButton>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Top Course Section */}
                {/* <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5 className="mb-0">Top Course</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-3 mb-4">
                        <CCol md={8}>
                          <CFormLabel>Add Top Course</CFormLabel>
                          <CFormInput
                            type="text"
                            placeholder="Enter a Top Course"
                            value={newtop}
                            onChange={(e) => setNewtop(e.target.value)}
                          />
                        </CCol>
                        <CCol md={4} className="d-flex align-items-end">
                          <CButton
                            color="primary"
                            onClick={handleAddtop}
                            disabled={!newtop.trim()}
                          >
                            <FaPlus className="me-1" /> Add Course
                          </CButton>
                        </CCol>
                      </CRow>

                      {(formData.topcourse || []).length === 0 ? (
                        <div className="text-center py-3 text-muted">No courses added yet.</div>
                      ) : (
                        (formData.topcourse || []).map((highlight, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-2 p-2 bg-light rounded"
                          >
                            <div className="flex-grow-1">
                              <CFormInput
                                value={highlight}
                                onChange={(e) => handleUpdatetop(index, e.target.value)}
                                placeholder="Edit Course"
                              />
                            </div>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleRemovetop(index)}
                              className="ms-2"
                            >
                              <FaTrash />
                            </CButton>
                          </div>
                        ))
                      )}
                    </CCardBody>
                  </CCard>
                </CCol> */}
              </CRow>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Title</CFormLabel>
                  <CFormInput
                    placeholder="MBA in International Business | Aston University"
                    {...register('seoInfo.metaTitle')}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Description</CFormLabel>
                  <CFormTextarea
                    rows={4}
                    placeholder="Brief description for search engines..."
                    {...register('seoInfo.metaDescription')}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Keywords</CFormLabel>
                  <CFormInput
                    placeholder="mba, business, international, uk university"
                    {...register('seoInfo.metaKeywords')}
                  />
                </CCol>
              </CRow>
            )}

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
              <CButton color="secondary" variant="outline" onClick={handleCancel}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Course'}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}


function DynamicArrayField({ control, register, fieldName, field, fieldPath, sectionIndex }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath
  })

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{field.label}</h6>
        <CButton
          color="primary"
          size="sm"
          onClick={() => {
            const newItem = {}
            Object.keys(field.fields).forEach(key => {
              newItem[key] = ''
            })
            append(newItem)
          }}
        >
          <FaPlus className="me-1" /> Add Item
        </CButton>
      </div>

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="p-3 bg-light rounded mb-2 border">
          <CRow className="g-2 align-items-start">
            {Object.keys(field.fields).map((subFieldName) => {
              const subField = field.fields[subFieldName]
              const subFieldPath = `${fieldPath}.${itemIndex}.${subFieldName}`

              if (subField.type === 'editor') {
                return (
                  <CCol key={subFieldName} md={10}>
                    <CFormLabel className="fw-semibold">{subField.label}</CFormLabel>
                    <Controller
                      name={subFieldPath}
                      control={control}
                      render={({ field: controllerField }) => (
                        <CKEditorComponent
                          value={controllerField.value || ''}
                          onChange={controllerField.onChange}
                        />
                      )}
                    />
                  </CCol>
                )
              } else if (subField.type === 'textarea') {
                return (
                  <CCol key={subFieldName} md={10}>
                    <CFormLabel className="fw-semibold">{subField.label}</CFormLabel>
                    <CFormTextarea
                      rows={2}
                      placeholder={subField.placeholder}
                      {...register(subFieldPath)}
                    />
                  </CCol>
                )
              } else {
                return (
                  <CCol key={subFieldName} md={10}>
                    <CFormLabel className="fw-semibold">{subField.label}</CFormLabel>
                    <CFormInput
                      placeholder={subField.placeholder}
                      {...register(subFieldPath)}
                    />
                  </CCol>
                )
              }
            })}
            <CCol md={2} className="d-flex align-items-end">
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                className="mb-2"
                onClick={() => remove(itemIndex)}
              >
                <FaTrash />
              </CButton>
            </CCol>
          </CRow>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center py-2 text-muted small">
          No items added. Click "Add Item" to create one.
        </div>
      )}
    </div>
  )
}





