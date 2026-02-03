// components/UniversityForm.js
import React, { useState, useEffect } from 'react'
import {
    CForm,
    CFormLabel,
    CFormInput,
    CFormTextarea,
    CFormSelect,
    CAlert,
    CSpinner,
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CRow,
    CCol,
    CInputGroup,
    CInputGroupText,
    CBadge,
    CFormCheck,
} from '@coreui/react'
import { FaPlus, FaTrash, FaYoutube, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt } from 'react-icons/fa'
import uploadService from '../../services/uploadService'
import * as countries from "../../../src/assets/Countries.json"
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
// import citiesByCountry from '../../data/cities'

const UniversityForm = ({
    university = null,
    onSubmit,
    onCancel,
    error,
    submitting = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        code: '',
        country: '',
        city: '',
        address: '',
        established_year: '',
        status: 'Active',
        short_description: '',
        uni_contact: '',
        uni_web: '',
        uni_type: 'public',
        intakes: [],
        on_campus_accommodation: false,
        uni_logo: '',
        logo_url: '',
        social_links: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
        },
        uni_gallery: {
            images: [],
            videos: []
        },
        uni_rank: [],
        google_location: {
            lat: '',
            lng: ''
        },
        financials: {
            cost_of_living: '',
            ug_fees: '',
            pg_fees: '',
            other_fees: ''
        },
        location_alias: '',
        seo_metadata: {
            meta_title: '',
            meta_description: '',
            canonical_tag: '',
            meta_keywords: ''
        },
        // extra_content fields
        sections: [],
        isPublished: true,
        extraStatus: 'Active',
    })

    const [imagePreview, setImagePreview] = useState('')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingGallery, setUploadingGallery] = useState(false)
    const [localError, setLocalError] = useState('')
    const [availableCities, setAvailableCities] = useState([])
    const [newIntake, setNewIntake] = useState({ month: '', year: new Date().getFullYear() })
    const [newGalleryImage, setNewGalleryImage] = useState('')
    const [newGalleryVideo, setNewGalleryVideo] = useState('')
    const [newSection, setNewSection] = useState({ section_key: '', heading: '', content: '', order: 0 })

    // Initialize form if editing
    useEffect(() => {
        if (university) {
            const uni = university
            const extra = uni.extra_content || {}

            setFormData({
                name: uni.name || '',
                slug: uni.slug || '',
                code: uni.code || '',
                country: uni.country || '',
                city: uni.city || '',
                address: uni.address || '',
                established_year: uni.established_year || '',
                status: uni.status || 'Active',
                short_description: uni.short_description || '',
                uni_contact: uni.uni_contact || '',
                uni_web: uni.uni_web || '',
                uni_type: uni.uni_type || 'public',
                intakes: Array.isArray(uni.intakes) ? uni.intakes : [],
                on_campus_accommodation: !!uni.on_campus_accommodation,
                uni_logo: uni.uni_logo || '',
                logo_url: uni.logo_url || '',
                social_links: {
                    facebook: uni.social_links?.facebook || '',
                    twitter: uni.social_links?.twitter || '',
                    instagram: uni.social_links?.instagram || '',
                    linkedin: uni.social_links?.linkedin || '',
                    youtube: uni.social_links?.youtube || ''
                },
                uni_gallery: {
                    images: Array.isArray(uni.uni_gallery?.images) ? uni.uni_gallery.images : [],
                    videos: Array.isArray(uni.uni_gallery?.videos) ? uni.uni_gallery.videos : []
                },
                uni_rank: uni.uni_rank || [],
                google_location: {
                    lat: uni.google_location?.lat || '',
                    lng: uni.google_location?.lng || ''
                },
                financials: {
                    cost_of_living: uni.financials?.cost_of_living || '',
                    ug_fees: uni.financials?.ug_fees || '',
                    pg_fees: uni.financials?.pg_fees || '',
                    other_fees: uni.financials?.other_fees || ''
                },
                location_alias: uni.location_alias || '',
                seo_metadata: {
                    meta_title: uni.seo_metadata?.meta_title || '',
                    meta_description: uni.seo_metadata?.meta_description || '',
                    canonical_tag: uni.seo_metadata?.canonical_tag || '',
                    meta_keywords: uni.seo_metadata?.meta_keywords || ''
                },
                sections: Array.isArray(extra.sections) && extra.sections.length > 0 ? extra.sections :
                    [{ section_key: 'overview', heading: 'Overview', content: '', order: 1 }],
                isPublished: extra.isPublished ?? true,
                extraStatus: extra.status || 'Active',
            })
            setImagePreview(uni.uni_logo || '')
        } else {
            // Reset for new
            setFormData({
                name: '',
                slug: '',
                code: '',
                country: '',
                city: '',
                address: '',
                established_year: '',
                status: 'Active',
                short_description: '',
                uni_contact: '',
                uni_web: '',
                uni_type: 'public',
                intakes: [],
                on_campus_accommodation: false,
                uni_logo: '',
                logo_url: '',
                social_links: {
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: '',
                    youtube: ''
                },
                uni_gallery: {
                    images: [],
                    videos: []
                },
                uni_rank: [],
                google_location: {
                    lat: '',
                    lng: ''
                },
                financials: {
                    cost_of_living: '',
                    ug_fees: '',
                    pg_fees: '',
                    other_fees: ''
                },
                location_alias: '',
                seo_metadata: {
                    meta_title: '',
                    meta_description: '',
                    canonical_tag: '',
                    meta_keywords: ''
                },
                sections: [{ section_key: 'overview', heading: 'Overview', content: '', order: 1 }],
                isPublished: true,
                extraStatus: 'Active',
            })
            setImagePreview('')
        }
        setLocalError('')
    }, [university])

    // Update cities when country changes
    //   useEffect(() => {
    //     if (formData.country) {
    //       setAvailableCities(citiesByCountry[formData.country] || [])
    //       if (!citiesByCountry[formData.country]?.includes(formData.city)) {
    //         setFormData(prev => ({ ...prev, city: '' }))
    //       }
    //     } else {
    //       setAvailableCities([])
    //     }
    //   }, [formData.country])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }))
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setLocalError('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setLocalError('Image size must be < 5MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)

        setUploadingImage(true)
        setLocalError('')
        try {
            const res = await uploadService.uploadImage(file)
            if (res.success) {
                setFormData(prev => ({ ...prev, uni_logo: res.data.url }))
            }
        } catch (err) {
            setLocalError(err.message || 'Upload failed')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleAddIntake = () => {
        if (!newIntake.month || !newIntake.year) return

        const intakeString = `${newIntake.month} ${newIntake.year}`
        if (!formData.intakes.includes(intakeString)) {
            setFormData(prev => ({
                ...prev,
                intakes: [...prev.intakes, intakeString]
            }))
            setNewIntake({ month: '', year: new Date().getFullYear() })
        }
    }

    const handleRemoveIntake = (intake) => {
        setFormData(prev => ({
            ...prev,
            intakes: prev.intakes.filter(i => i !== intake)
        }))
    }

    const handleAddGalleryImage = () => {
        if (newGalleryImage.trim()) {
            setFormData(prev => ({
                ...prev,
                uni_gallery: {
                    ...prev.uni_gallery,
                    images: [...prev.uni_gallery.images, newGalleryImage.trim()]
                }
            }))
            setNewGalleryImage('')
        }
    }

    const handleAddGalleryVideo = () => {
        if (newGalleryVideo.trim()) {
            setFormData(prev => ({
                ...prev,
                uni_gallery: {
                    ...prev.uni_gallery,
                    videos: [...prev.uni_gallery.videos, newGalleryVideo.trim()]
                }
            }))
            setNewGalleryVideo('')
        }
    }

    const handleRemoveGalleryItem = (type, index) => {
        setFormData(prev => {
            const gallery = { ...prev.uni_gallery }
            gallery[type] = gallery[type].filter((_, i) => i !== index)
            return { ...prev, uni_gallery: gallery }
        })
    }

    const handleAddSection = () => {
        if (!newSection.section_key || !newSection.heading) return

        const order = formData.sections.length + 1
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { ...newSection, order }]
        }))
        setNewSection({ section_key: '', heading: '', content: '', order: 0 })
    }

    const handleUpdateSection = (index, field, value) => {
        const updatedSections = [...formData.sections]
        updatedSections[index] = { ...updatedSections[index], [field]: value }
        setFormData(prev => ({ ...prev, sections: updatedSections }))
    }

    const handleRemoveSection = (index) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Generate slug if not provided
        const slug = formData.slug || formData.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')

        // Build payload matching your backend schema
        const payload = {
            name: formData.name,
            slug: slug,
            code: formData.code,
            country: formData.country,
            city: formData.city,
            address: formData.address,
            established_year: formData.established_year ? parseInt(formData.established_year) : null,
            status: formData.status,
            short_description: formData.short_description,
            uni_contact: formData.uni_contact,
            uni_web: formData.uni_web,
            uni_type: formData.uni_type,
            intakes: formData.intakes,
            on_campus_accommodation: formData.on_campus_accommodation,
            uni_logo: formData.uni_logo,
            social_links: formData.social_links,
            uni_gallery: formData.uni_gallery,
            uni_rank: formData.uni_rank || [],
            google_location: formData.google_location,
            financials: formData.financials,
            location_alias: formData.location_alias,
            seo_metadata: formData.seo_metadata,
            extra_content: {
                sections: formData.sections,
                isPublished: formData.isPublished,
                status: formData.extraStatus,
            }
        }

        onSubmit(payload)
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const sectionKeys = [
        'overview', 'academics', 'campus_life', 'admissions',
        'scholarships', 'facilities', 'research', 'alumni'
    ]

    return (
        <CForm onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {(error || localError) && (
                <CAlert color="danger" className="mb-3">
                    {error || localError}
                </CAlert>
            )}

            {/* Basic Information */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Basic Information</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>University Name *</CFormLabel>
                            <CFormInput
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter university name"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>University Code *</CFormLabel>
                            <CFormInput
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., U001"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Slug (URL Friendly)</CFormLabel>
                            <CFormInput
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="auto-generated if empty"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>University Type</CFormLabel>
                            <CFormSelect
                                name="uni_type"
                                value={formData.uni_type}
                                onChange={handleInputChange}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="other">Other</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Country *</CFormLabel>
                            <CFormSelect
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Country</option>
                                <option value="uk">uk</option>


                                {/* {countries.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))} */}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>City *</CFormLabel>
                            <CFormInput
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter city"
                            />
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel>Address</CFormLabel>
                            <CFormInput
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Full address"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Established Year</CFormLabel>
                            <CFormInput
                                name="established_year"
                                type="number"
                                min="1500"
                                max={new Date().getFullYear()}
                                value={formData.established_year}
                                onChange={handleInputChange}
                                placeholder="e.g., 1850"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Status</CFormLabel>
                            <CFormSelect name="status" value={formData.status} onChange={handleInputChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Under Review">Under Review</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel>Short Description</CFormLabel>
                            <CFormTextarea
                                name="short_description"
                                value={formData.short_description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Brief description about the university"
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Contact & Website */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Contact & Website</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Contact Number</CFormLabel>
                            <CFormInput
                                name="uni_contact"
                                value={formData.uni_contact}
                                onChange={handleInputChange}
                                placeholder="+1 234 567 8900"
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Website URL</CFormLabel>
                            <CFormInput
                                name="uni_web"
                                type="url"
                                value={formData.uni_web}
                                onChange={handleInputChange}
                                placeholder="https://university.edu"
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* University Logo */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>University Logo</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Upload Logo</CFormLabel>
                            <CFormInput
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploadingImage}
                            />
                            {uploadingImage && <CSpinner size="sm" className="ms-2" />}
                            <small className="text-muted">Max size: 5MB (PNG, JPG, JPEG)</small>
                        </CCol>
                        {(imagePreview || formData.uni_logo) && (
                            <CCol md={12}>
                                <CFormLabel>Logo Preview</CFormLabel>
                                <div className="mt-2">
                                    <img
                                        src={imagePreview || formData.uni_logo}
                                        alt="University Logo"
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
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Intakes */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Intakes</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3 align-items-end">
                        <CCol md={4}>
                            <CFormLabel>Month</CFormLabel>
                            <CFormSelect
                                value={newIntake.month}
                                onChange={(e) => setNewIntake(prev => ({ ...prev, month: e.target.value }))}
                            >
                                <option value="">Select Month</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel>Year</CFormLabel>
                            <CFormInput
                                type="number"
                                min={new Date().getFullYear()}
                                max={new Date().getFullYear() + 5}
                                value={newIntake.year}
                                onChange={(e) => setNewIntake(prev => ({ ...prev, year: e.target.value }))}
                            />
                        </CCol>
                        <CCol md={4}>
                            <CButton color="primary" onClick={handleAddIntake} disabled={!newIntake.month}>
                                <FaPlus /> Add Intake
                            </CButton>
                        </CCol>
                    </CRow>

                    {formData.intakes.length > 0 && (
                        <div className="mt-3">
                            <CFormLabel>Selected Intakes:</CFormLabel>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {formData.intakes.map((intake, index) => (
                                    <CBadge key={index} color="primary" className="p-2 d-flex align-items-center gap-1">
                                        {intake}
                                        <FaTrash
                                            size={12}
                                            className="ms-2 cursor-pointer"
                                            onClick={() => handleRemoveIntake(intake)}
                                        />
                                    </CBadge>
                                ))}
                            </div>
                        </div>
                    )}
                </CCardBody>
            </CCard>

            {/* Social Links */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Social Media Links</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <FaFacebook />
                                </CInputGroupText>
                                <CFormInput
                                    type="url"
                                    placeholder="Facebook URL"
                                    value={formData.social_links.facebook}
                                    onChange={(e) => handleNestedChange('social_links', 'facebook', e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <FaTwitter />
                                </CInputGroupText>
                                <CFormInput
                                    type="url"
                                    placeholder="Twitter URL"
                                    value={formData.social_links.twitter}
                                    onChange={(e) => handleNestedChange('social_links', 'twitter', e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <FaInstagram />
                                </CInputGroupText>
                                <CFormInput
                                    type="url"
                                    placeholder="Instagram URL"
                                    value={formData.social_links.instagram}
                                    onChange={(e) => handleNestedChange('social_links', 'instagram', e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <FaLinkedin />
                                </CInputGroupText>
                                <CFormInput
                                    type="url"
                                    placeholder="LinkedIn URL"
                                    value={formData.social_links.linkedin}
                                    onChange={(e) => handleNestedChange('social_links', 'linkedin', e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <FaYoutube />
                                </CInputGroupText>
                                <CFormInput
                                    type="url"
                                    placeholder="YouTube URL"
                                    value={formData.social_links.youtube}
                                    onChange={(e) => handleNestedChange('social_links', 'youtube', e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* University Gallery */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>University Gallery</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={12}>
                            <h6>Images</h6>
                            <CRow className="g-2 mb-3">
                                <CCol md={8}>
                                    <CFormInput
                                        type="url"
                                        placeholder="Enter image URL"
                                        value={newGalleryImage}
                                        onChange={(e) => setNewGalleryImage(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CButton color="primary" onClick={handleAddGalleryImage} disabled={!newGalleryImage.trim()}>
                                        <FaPlus /> Add Image
                                    </CButton>
                                </CCol>
                            </CRow>

                            {formData.uni_gallery.images.length > 0 && (
                                <div className="mb-4">
                                    <CRow className="g-2">
                                        {formData.uni_gallery.images.map((image, index) => (
                                            <CCol md={3} key={index}>
                                                <div className="position-relative">
                                                    <img
                                                        src={image}
                                                        alt={`Gallery ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <div
                                                        className="position-absolute top-0 end-0 bg-danger text-white rounded-circle p-1 cursor-pointer"
                                                        style={{ transform: 'translate(30%, -30%)' }}
                                                        onClick={() => handleRemoveGalleryItem('images', index)}
                                                    >
                                                        <FaTrash size={12} />
                                                    </div>
                                                </div>
                                            </CCol>
                                        ))}
                                    </CRow>
                                </div>
                            )}
                        </CCol>

                        <CCol md={12}>
                            <h6>Videos</h6>
                            <CRow className="g-2 mb-3">
                                <CCol md={8}>
                                    <CFormInput
                                        type="url"
                                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                        value={newGalleryVideo}
                                        onChange={(e) => setNewGalleryVideo(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CButton color="primary" onClick={handleAddGalleryVideo} disabled={!newGalleryVideo.trim()}>
                                        <FaPlus /> Add Video
                                    </CButton>
                                </CCol>
                            </CRow>

                            {formData.uni_gallery.videos.length > 0 && (
                                <div>
                                    {formData.uni_gallery.videos.map((video, index) => (
                                        <div key={index} className="d-flex align-items-center gap-2 mb-2">
                                            <div className="flex-grow-1 text-truncate">{video}</div>
                                            <CButton
                                                color="danger"
                                                size="sm"
                                                onClick={() => handleRemoveGalleryItem('videos', index)}
                                            >
                                                <FaTrash />
                                            </CButton>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <CCard className="mb-4">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">University Rankings</h5>
                    <CButton
                        color="primary"
                        size="sm"
                        onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                uni_rank: [
                                    ...prev.uni_rank,
                                    { type: '', rank: '', year: new Date().getFullYear().toString() }
                                ]
                            }))
                        }}
                    >
                        <FaPlus /> Add Ranking
                    </CButton>
                </CCardHeader>
                <CCardBody>
                    {formData.uni_rank && formData.uni_rank.length > 0 ? (
                        formData.uni_rank.map((rank, index) => (
                            <CRow key={index} className="g-3 mb-3 align-items-end">
                                <CCol md={4}>
                                    <CFormLabel>Ranking Type</CFormLabel>
                                    <CFormSelect
                                        value={rank.type}
                                        onChange={(e) => {
                                            const updatedRanks = [...formData.uni_rank]
                                            updatedRanks[index].type = e.target.value
                                            setFormData(prev => ({ ...prev, uni_rank: updatedRanks }))
                                        }}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="QS World">QS World University Rankings</option>
                                        <option value="THE">Times Higher Education</option>
                                        <option value="ARWU">Academic Ranking of World Universities</option>
                                        <option value="US News">U.S. News & World Report</option>
                                        <option value="National">National Ranking</option>
                                        <option value="Subject">Subject Ranking</option>
                                        <option value="Employability">Employability Ranking</option>
                                        <option value="Research">Research Ranking</option>
                                        <option value="Other">Other</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Rank</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        placeholder="e.g., #150"
                                        value={rank.rank}
                                        onChange={(e) => {
                                            const updatedRanks = [...formData.uni_rank]
                                            updatedRanks[index].rank = e.target.value
                                            setFormData(prev => ({ ...prev, uni_rank: updatedRanks }))
                                        }}
                                        required
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Year</CFormLabel>
                                    <CFormInput
                                        type="number"
                                        min="2000"
                                        max={new Date().getFullYear() + 1}
                                        placeholder="e.g., 2024"
                                        value={rank.year}
                                        onChange={(e) => {
                                            const updatedRanks = [...formData.uni_rank]
                                            updatedRanks[index].year = e.target.value
                                            setFormData(prev => ({ ...prev, uni_rank: updatedRanks }))
                                        }}
                                    />
                                </CCol>
                                <CCol md={2} className="text-end">
                                    {formData.uni_rank.length > 1 && (
                                        <CButton
                                            color="danger"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const updatedRanks = formData.uni_rank.filter((_, i) => i !== index)
                                                setFormData(prev => ({ ...prev, uni_rank: updatedRanks }))
                                            }}
                                            title="Remove this ranking"
                                        >
                                            <FaTrash />
                                        </CButton>
                                    )}
                                </CCol>
                            </CRow>
                        ))
                    ) : (
                        <div className="text-center py-4 text-muted">
                            No rankings added yet. Click "Add Ranking" to add one.
                        </div>
                    )}
                </CCardBody>
            </CCard>

            {/* Google Location */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Google Map Location</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Latitude</CFormLabel>
                            <CFormInput
                                type="number"
                                step="any"
                                placeholder="e.g., 40.7128"
                                value={formData.google_location.lat}
                                onChange={(e) => handleNestedChange('google_location', 'lat', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Longitude</CFormLabel>
                            <CFormInput
                                type="number"
                                step="any"
                                placeholder="e.g., -74.0060"
                                value={formData.google_location.lng}
                                onChange={(e) => handleNestedChange('google_location', 'lng', e.target.value)}
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Accommodation & Financials */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Accommodation & Financial Information</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={5} className="mb-3 ms-2 border rounded p-2">
                            <CFormCheck
                                label="On-Campus Accommodation Available"
                                checked={formData.on_campus_accommodation}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    on_campus_accommodation: e.target.checked
                                }))}
                            />
                        </CCol>
                        <CCol md={5} className="mb-3 border ms-3 rounded p-2">
                            <CFormCheck
                                label="Off-Campus Accommodation Available"
                                checked={formData.off_campus_accommodation}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    off_campus_accommodation: e.target.checked
                                }))}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Cost of Living (Annual)</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="e.g., $15,000"
                                value={formData.financials.cost_of_living}
                                onChange={(e) => handleNestedChange('financials', 'cost_of_living', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Undergraduate Fees (Annual)</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="e.g., $25,000"
                                value={formData.financials.ug_fees}
                                onChange={(e) => handleNestedChange('financials', 'ug_fees', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Postgraduate Fees (Annual)</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="e.g., $30,000"
                                value={formData.financials.pg_fees}
                                onChange={(e) => handleNestedChange('financials', 'pg_fees', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Other Fees</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="e.g., Application Fee: $100"
                                value={formData.financials.other_fees}
                                onChange={(e) => handleNestedChange('financials', 'other_fees', e.target.value)}
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Location Views</h5>
                </CCardHeader>
                <CCardBody>
                    <div>
                        <CFormLabel>Is in Slider</CFormLabel>
                        <CFormInput
                            name="location_alias"
                            value={formData.location_alias}
                            onChange={handleInputChange}
                            placeholder="e.g., usa/new-york/university-name"
                        />
                    </div>
                    <div>
                        <CFormLabel>Is in stats</CFormLabel>
                        <CFormInput
                            name="location_alias"
                            value={formData.location_alias}
                            onChange={handleInputChange}
                            placeholder="e.g., usa/new-york/university-name"
                        />
                    </div>
                    <div>
                        <CFormLabel>Success Rate</CFormLabel>
                        <CFormInput
                            name="location_alias"
                            value={formData.location_alias}
                            onChange={handleInputChange}
                            placeholder="e.g., usa/new-york/university-name"
                        />
                    </div>
                </CCardBody>
            </CCard>

            {/* Location Alias */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>Location Alias (Route)</h5>
                </CCardHeader>
                <CCardBody>
                    <CFormLabel>Custom URL Path</CFormLabel>
                    <CFormInput
                        name="location_alias"
                        value={formData.location_alias}
                        onChange={handleInputChange}
                        placeholder="e.g., usa/new-york/university-name"
                    />
                    <small className="text-muted">
                        This will be used for custom routing. Example: /universities/university-name
                    </small>

                </CCardBody>
            </CCard>

            {/* SEO Metadata */}
            <CCard className="mb-4">
                <CCardHeader>
                    <h5>SEO Metadata</h5>
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">
                        <CCol md={12}>
                            <CFormLabel>Meta Title</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="Page title for search engines"
                                value={formData.seo_metadata.meta_title}
                                onChange={(e) => handleNestedChange('seo_metadata', 'meta_title', e.target.value)}
                            />
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel>Meta Description</CFormLabel>
                            <CFormTextarea
                                rows="2"
                                placeholder="Page description for search engines"
                                value={formData.seo_metadata.meta_description}
                                onChange={(e) => handleNestedChange('seo_metadata', 'meta_description', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Canonical Tag</CFormLabel>
                            <CFormInput
                                type="url"
                                placeholder="Canonical URL"
                                value={formData.seo_metadata.canonical_tag}
                                onChange={(e) => handleNestedChange('seo_metadata', 'canonical_tag', e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel>Meta Keywords</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="comma, separated, keywords"
                                value={formData.seo_metadata.meta_keywords}
                                onChange={(e) => handleNestedChange('seo_metadata', 'meta_keywords', e.target.value)}
                            />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Extra Content Sections */}
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
                                value={newSection.order || formData?.sections?.length + 1}
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
                    {formData.sections.map((section, index) => (
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
                                label="Published"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isPublished: e.target.checked
                                }))}
                            />
                        </CCol>
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

            {/* Form Actions */}
            <div className="mt-4 d-flex justify-content-end gap-2">
                <CButton
                    type="button"
                    color="secondary"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </CButton>
                <CButton
                    type="submit"
                    color="primary"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <CSpinner size="sm" className="me-2" />
                            {university ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        university ? 'Update University' : 'Create University'
                    )}
                </CButton>
            </div>
        </CForm>
    )
}

export default UniversityForm