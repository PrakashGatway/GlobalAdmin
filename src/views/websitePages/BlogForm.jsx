// src/views/blogs/BlogForm.js
import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CButton,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CAlert,
    CSpinner,
    CFormCheck,
    CFormLabel,
    CForm,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import { useNavigate, useParams } from 'react-router-dom'
// import ReactQuill from 'react-quill'
// import 'react-quill/dist/quill.snow.css'
import apiService from '../../services/apiService'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import uploadService from '../../services/uploadService'
import { CustomMultiSelect } from '../scholarship/ScholarshipForm'

const blogService = {
    getBlog: (id) => apiService.get(`/blogs/${id}`).then(res => res.data),
    createBlog: (data) => apiService.post('/blogs', data).then(res => res),
    updateBlog: (id, data) => apiService.put(`/blogs/${id}`, data).then(res => res),
    getCategories: () => apiService.get('/blogs/categories').then(res => res.data),
}

const BlogForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        shortDescription: '',
        content: '',
        category: [],
        status: 'Draft',
        isFeatured: false,
    })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    // Fetch categories and blog data (if editing)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [cats, blog] = await Promise.all([
                    blogService.getCategories(),
                    isEditing ? blogService.getBlog(id) : null
                ])

                setCategories(cats)
                if (isEditing && blog) {
                    setFormData({
                        title: blog.title || '',
                        slug: blog.slug || '',
                        shortDescription: blog.shortDescription || '',
                        content: blog.description || '',
                        category: [] || [],
                        status: blog.status || 'Draft',
                        isFeatured: blog.isFeatured || false,
                        coverImage: blog.coverImage || '',
                        blogType: blog.blogType || 'blog',
                        seo: {
                            metaTitle: blog.seo?.metaTitle || '',
                            metaDescription: blog.seo?.metaDescription || '',
                            keywords: blog.seo?.keywords || ''
                        },
                        extraMetadata: blog.extraMetadata
                    })
                }

            } catch (err) {
                setError(err.message || 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, isEditing])

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

        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        setUploadingImage(true)
        setError('')
        try {
            const response = await uploadService.uploadImage(file)
            if (response.success) {
                setFormData((prev) => ({
                    ...prev,
                    coverImage: response.data.url,
                }))
            }
        } catch (err) {
            setError(err.message || 'Failed to upload image')
            setImagePreview('')
        } finally {
            setUploadingImage(false)
        }
    }
    // Auto-generate slug
    useEffect(() => {
        if (!isEditing && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-')
            setFormData(prev => ({ ...prev, slug }))
        }
    }, [formData.title, isEditing])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name.startsWith("seo.")) {
            const key = name.split(".")[1]
            setFormData(prev => ({
                ...prev,
                seo: {
                    ...prev.seo,
                    [key]: value
                }
            }))

        } else if (name.startsWith("extraMetadata.")) {
            const key = name.split(".")[1]
            setFormData(prev => ({
                ...prev,
                extraMetadata: {
                    ...prev.extraMetadata,
                    [key]: value
                }
            }))

        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }))
        }
    }


    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const payload = {
                ...formData,
                description: formData.content || undefined,
                category: formData.category || undefined
            }

            let res
            if (isEditing) {
                res = await blogService.updateBlog(id, payload)
                setSuccess('Blog updated successfully!')
            } else {
                res = await blogService.createBlog(payload)
                setSuccess('Blog created successfully!')
            }

            if (res.success) {
                setTimeout(() => navigate('/blogs'), 1500)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <CRow className="justify-content-center my-5">
                <CCol xs="auto">
                    <CSpinner size="lg" />
                </CCol>
            </CRow>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible>{error}</CAlert>}
                {success && <CAlert color="success" dismissible>{success}</CAlert>}

                <CCard className="shadow-sm">
                    <CCardHeader className="d-flex justify-content-between align-items-center bg-light">
                        <div>
                            <h4 className="mb-0 fw-bold">
                                {isEditing ? 'Edit Blog' : 'Create New Blog'}
                            </h4>
                            <small className="text-body-secondary">
                                {isEditing ? 'Update your blog details' : 'Fill in the details for your new blog'}
                            </small>
                        </div>
                        <CButton
                            color="secondary"
                            variant="outline"
                            onClick={() => navigate('/blogs')}
                        >
                            <CIcon icon={cilArrowLeft} className="me-1" />
                            Back to Blogs
                        </CButton>
                    </CCardHeader>

                    <CCardBody>
                        <CForm onSubmit={handleSubmit}>
                            <CRow className="mb-4 ">
                                <CCol md={8} className='border rounded p-3'>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="title">Title *</CFormLabel>
                                        <CFormInput
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter blog title"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="slug">Slug *</CFormLabel>
                                        <CFormInput
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            required
                                            placeholder="URL-friendly version of title"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="shortDescription">Short Description</CFormLabel>
                                        <CFormTextarea
                                            id="shortDescription"
                                            name="shortDescription"
                                            value={formData.shortDescription}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Brief summary of the blog"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <CFormLabel htmlFor="seo.metaTitle">Meta Title *</CFormLabel>
                                        <CFormInput
                                            id="seo.metaTitle"
                                            name="seo.metaTitle"
                                            value={formData?.seo?.metaTitle || ''}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter metaTitle title"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="seo.metaDescription">Meta Description *</CFormLabel>
                                        <CFormTextarea
                                            id="seo.metaDescription"
                                            name="seo.metaDescription"
                                            value={formData?.seo?.metaDescription || ''}
                                            onChange={handleChange}
                                            required
                                            rows={2}
                                            placeholder="Enter metaDescription title"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <CFormLabel htmlFor="seo.keywords">Meta Keywords *</CFormLabel>
                                        <CFormTextarea
                                            id="seo.keywords"
                                            name="seo.keywords"
                                            value={formData?.seo?.keywords || ''}
                                            onChange={handleChange}
                                            required
                                            rows={2}
                                            placeholder="Enter metaKeywords title"
                                        />
                                        <small>Meta keywords should be separated by commas</small>
                                    </div>


                                    <div className="mb-3">
                                        <CFormLabel>Content *</CFormLabel>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.content}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                setFormData(prev => ({ ...prev, content: data }));
                                            }}
                                        />
                                    </div>
                                </CCol>

                                <CCol md={4}>
                                    <div className="" style={{ top: '100px', zIndex: '0' }}>
                                        <CCard className="border">
                                            <CCardBody>
                                                <div className="mb-3">
                                                    <CFormLabel htmlFor="category">Cover Image *</CFormLabel>

                                                    <CFormInput
                                                        type="file"
                                                        id="image"
                                                        name="image"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        disabled={uploadingImage}
                                                    />
                                                    {uploadingImage && (
                                                        <div className="mt-2">
                                                            <CSpinner size="sm" /> <small>Uploading image...</small>
                                                        </div>
                                                    )}
                                                    {imagePreview && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                style={{
                                                                    maxWidth: '200px',
                                                                    maxHeight: '200px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #dee2e6',
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {formData.coverImage && !imagePreview && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={formData.coverImage}
                                                                alt="Current"
                                                                style={{
                                                                    maxWidth: '200px',
                                                                    maxHeight: '200px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #dee2e6',
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="mb-3">
                                                    <CFormLabel htmlFor="category">Category *</CFormLabel>
                                                    <CustomMultiSelect
                                                        options={categories}
                                                        value={formData.category}
                                                        onChange={(value) =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                category: value
                                                            }))
                                                        }
                                                        placeholder="Search and select categories..."
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <CFormLabel htmlFor="status">Status</CFormLabel>
                                                    <CFormSelect
                                                        id="status"
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="Draft">Draft</option>
                                                        <option value="Published">Published</option>
                                                    </CFormSelect>
                                                </div>
                                                <div className="mb-3">
                                                    <CFormLabel htmlFor="blogType">Type</CFormLabel>
                                                    <CFormSelect
                                                        id="blogType"
                                                        name="blogType"
                                                        value={formData.blogType}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="blog">Blog</option>
                                                        <option value="event">Event</option>
                                                        {/* <option value="university">University</option>
                                                        <option value="program">Program</option> */}
                                                        <option value="webnair">Webnair</option>
                                                    </CFormSelect>
                                                </div>

                                                {(formData.blogType === 'event' || formData.blogType === 'webnair') && (
                                                    <>
                                                        <div className="mb-3">
                                                            <CFormLabel htmlFor="eventDate">Event Date *</CFormLabel>
                                                            <CFormInput
                                                                type="date"
                                                                id="eventDate"
                                                                name="extraMetadata.eventDate"
                                                                value={formData?.extraMetadata?.eventDate || ''}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className='mb-3 d-flex justify-content-between gap-2'>
                                                            <div className="w-50">
                                                                <CFormLabel htmlFor="startTime">Event start time *</CFormLabel>
                                                                <CFormInput
                                                                    type="time"
                                                                    id="startTime"
                                                                    name="extraMetadata.startTime"
                                                                    value={formData?.extraMetadata?.startTime || ''}
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="w-50">
                                                                <CFormLabel htmlFor="endTime">Event end time *</CFormLabel>
                                                                <CFormInput
                                                                    type="time"
                                                                    id="endTime"
                                                                    name="extraMetadata.endTime"
                                                                    value={formData?.extraMetadata?.endTime || ''}
                                                                    onChange={handleChange}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <CFormLabel htmlFor="location">location *</CFormLabel>
                                                            <CFormInput
                                                                type="text"
                                                                id="location"
                                                                name="extraMetadata.location"
                                                                value={formData?.extraMetadata?.location || ''}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <CFormLabel htmlFor="form">Event Type *</CFormLabel>
                                                            <CFormSelect
                                                                id="form"
                                                                name="extraMetadata.eventType"
                                                                value={formData?.extraMetadata?.eventType || ''}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="physical">Physical</option>
                                                                <option value="virtual">Virtual</option>
                                                                <option value="live">Live</option>
                                                            </CFormSelect>

                                                        </div>

                                                    </>
                                                )}

                                                <div className="mb-3">
                                                    <CFormCheck
                                                        id="isFeatured"
                                                        name="isFeatured"
                                                        label="Featured Post"
                                                        checked={formData.isFeatured}
                                                        onChange={handleChange}
                                                    />
                                                    <div className="text-muted small mt-1">
                                                        Featured posts appear prominently on your site
                                                    </div>
                                                </div>

                                                <div className="d-grid gap-2 mt-4">
                                                    <CButton
                                                        type="submit"
                                                        color="primary"
                                                        size="lg"
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <CSpinner size="sm" className="me-2" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CIcon icon={cilSave} className="me-2" />
                                                                {isEditing ? 'Update Blog' : 'Create Blog'}
                                                            </>
                                                        )}
                                                    </CButton>

                                                    <CButton
                                                        color="secondary"
                                                        variant="outline"
                                                        onClick={() => navigate('/blogs')}
                                                    >
                                                        Cancel
                                                    </CButton>
                                                </div>
                                            </CCardBody>
                                        </CCard>
                                    </div>
                                </CCol>
                            </CRow>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default BlogForm