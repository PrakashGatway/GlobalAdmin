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
  CSpinner,
  CProgress,
  CInputGroup,
  CInputGroupText,
  CAlert,
} from '@coreui/react'
import '@coreui/coreui/dist/css/coreui.min.css'
import toast from 'react-hot-toast'
import CKEditorComponent from '../page-information/Ckeditor'
import { FaPlus, FaTrash, FaGripVertical, FaUpload, FaImage, FaTimes, FaCheck } from 'react-icons/fa'
import apiService, { getApiBaseUrl } from '../../services/apiService'
import Select from 'react-select'
import uploadService from '../../services/uploadService'
import { cilWarning, cilCheckCircle, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

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

// ==================== IMAGE UPLOAD COMPONENT ====================
const ImageUploader = ({ value, onChange, label = "Cover Image", maxSize = 5, aspectRatio = "16/9" }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState(value || '')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = React.useRef(null)

  useEffect(() => {
    if (value) {
      setPreview(value)
    }
  }, [value])

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, WebP or GIF.')
      return false
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`)
      return false
    }
    setError('')
    return true
  }

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)

    setUploading(true)
    setUploadProgress(0)

    // Simulate progress (since uploadService might not provide progress)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const res = await uploadService.uploadImage(file)
      clearInterval(progressInterval)
      
      if (res.success) {
        setUploadProgress(100)
        onChange(res.data.url)
        toast.success('Image uploaded successfully!')
        
        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress(0)
        }, 1000)
      } else {
        throw new Error(res.message || 'Upload failed')
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err.message || 'Upload failed. Please try again.')
      toast.error(err.message || 'Image upload failed')
      setPreview(value || '') // Revert to previous value
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const removeImage = () => {
    setPreview('')
    onChange('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mb-3">
      <CFormLabel className="fw-semibold">
        {label}
      </CFormLabel>

      <div
        className={`position-relative border rounded-3 p-4 text-center ${
          dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          minHeight: '200px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: uploading ? 0.7 : 1,
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="d-none"
          disabled={uploading}
        />

        {preview ? (
          <div className="position-relative">
            <img
              src={preview}
              alt="Cover preview"
              className="rounded-2"
              style={{
                maxHeight: '300px',
                maxWidth: '100%',
                objectFit: 'cover',
                aspectRatio: aspectRatio,
              }}
            />
            
            {/* Image overlay with actions */}
            <div 
              className="position-absolute top-0 end-0 p-2 d-flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <CButton
                color="light"
                size="sm"
                className="rounded-circle shadow-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={uploading}
                title="Change image"
              >
                <FaImage size={14} />
              </CButton>
              <CButton
                color="danger"
                size="sm"
                className="rounded-circle shadow-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                disabled={uploading}
                title="Remove image"
              >
                <FaTimes size={14} />
              </CButton>
            </div>

            {/* Upload progress overlay */}
            {uploading && (
              <div className="position-absolute top-50 start-50 translate-middle w-75">
                <CProgress 
                  value={uploadProgress} 
                  color="primary"
                  className="mb-2"
                  style={{ height: '6px' }}
                />
                <small className="text-white bg-dark bg-opacity-50 px-2 py-1 rounded">
                  Uploading... {uploadProgress}%
                </small>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            {uploading ? (
              <div className="text-center">
                <CSpinner color="primary" size="lg" className="mb-3" />
                <div className="mb-2">
                  <CProgress 
                    value={uploadProgress} 
                    color="primary"
                    style={{ height: '6px', width: '200px' }}
                    className="mx-auto"
                  />
                </div>
                <p className="text-muted mb-0">Uploading image... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <FaUpload size={40} className="text-muted mb-2" />
                </div>
                <h6 className="fw-semibold">
                  {dragOver ? 'Drop image here' : 'Click or drag image to upload'}
                </h6>
                <p className="text-muted small mb-2">
                  Supported formats: JPG, PNG, WebP, GIF
                </p>
                <p className="text-muted small mb-0">
                  Maximum file size: {maxSize}MB
                </p>
                <div className="mt-3">
                  <CButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    disabled={uploading}
                  >
                    <FaUpload className="me-2" />
                    Choose Image
                  </CButton>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-2">
            <CAlert color="danger" className="py-2 px-3 d-flex align-items-center">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </CAlert>
          </div>
        )}

        {preview && !uploading && (
          <div className="mt-2">
            <CAlert color="success" className="py-2 px-3 d-flex align-items-center">
              <CIcon icon={cilCheckCircle} className="me-2 flex-shrink-0" />
              <small>Image uploaded successfully</small>
            </CAlert>
          </div>
        )}
      </div>

      {/* Direct URL input as fallback */}
      <div className="mt-2">
        <small className="text-muted">Or enter image URL directly:</small>
        <CInputGroup className="mt-1">
          <CInputGroupText>
            <FaImage className="text-muted" />
          </CInputGroupText>
          <CFormInput
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setPreview(e.target.value)
            }}
            disabled={uploading}
          />
        </CInputGroup>
      </div>
    </div>
  )
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
  const [isLoading, setIsLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)

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

  const apiUrl = getApiBaseUrl();
  const exactApiUrl = `${apiUrl}/accommodation`;

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const finalData = {
        ...data,
        topcourse: formData.topcourse || [],
      }

      const url = editingId
        ? `${exactApiUrl}/courses/${editingId}`
        : `${exactApiUrl}/courses`

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
      
      // Refetch courses list
      fetchCourses()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Something went wrong!')
    } finally {
      setIsLoading(false)
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

  const fetchCourses = async () => {
    setFetchLoading(true)
    try {
      const response = await fetch(`${exactApiUrl}/courses`)
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to fetch courses')
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleEdit = async (id) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${exactApiUrl}/courses/${id}`)
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
    } finally {
      setIsLoading(false)
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
    const isConfirmed = window.confirm('Are you sure you want to delete this course? This action cannot be undone.')
    if (!isConfirmed) return

    setIsLoading(true)
    try {
      const response = await fetch(`${exactApiUrl}/courses/${id}`, {
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
    } finally {
      setIsLoading(false)
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
            {fetchLoading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" size="lg" />
                <p className="mt-3 text-muted">Loading courses...</p>
              </div>
            ) : (
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
                  {courses.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center py-5">
                        <FaImage size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">No courses found</h5>
                        <p className="text-muted mb-3">Get started by creating your first course</p>
                        <CButton color="primary" onClick={handleCreateNew}>
                          Create New Course
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    courses.map((course) => (
                      <CTableRow key={course._id} className="border-bottom">
                        <CTableDataCell className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            {course.coverImage && (
                              <img
                                src={course.coverImage}
                                alt={course.title}
                                className="rounded"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                }}
                              />
                            )}
                            <div>
                              <div className="fw-semibold text-dark">{course.title}</div>
                              <small className="text-medium-emphasis d-block">{course.slug}</small>
                            </div>
                          </div>
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
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell className="text-center px-4 py-3">
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(course.slug)}
                            disabled={isLoading}
                          >
                            Edit
                          </CButton>
                          <CButton
                            onClick={() => handleDelete(course._id)}
                            color="danger"
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                          >
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
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
                  <CFormSelect
                    id="level"
                    invalid={!!errors.level}
                    {...register("level", { required: true })}
                  >
                    <option value="">Select Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                  </CFormSelect>
                  {errors.level && <div className="invalid-feedback d-block">Level is required</div>}
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
                  <Controller
                    name="coverImage"
                    control={control}
                    render={({ field }) => (
                      <ImageUploader
                        value={field.value}
                        onChange={field.onChange}
                        label="Cover Image"
                        maxSize={5}
                        aspectRatio="16/9"
                      />
                    )}
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

            {/* SECTIONS TAB */}
            {activeTab === 'sections' && (
              <CRow className="g-4">

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
              <CButton 
                color="secondary" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </CButton>
              <CButton 
                color="primary" 
                type="submit" 
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    {editingId ? 'Saving Changes...' : 'Creating Course...'}
                  </>
                ) : (
                  editingId ? 'Save Changes' : 'Create Course'
                )}
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