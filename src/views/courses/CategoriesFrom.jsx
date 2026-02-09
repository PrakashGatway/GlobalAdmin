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
} from '@coreui/react';

const CourseCategoryForm = ({ category, onSubmit, onCancel, error, submitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    icon: '',
  });


  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        icon: category.icon || '',
      });
    }
  }, [category]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <CForm onSubmit={handleSubmit}>
      {error && (
        <CAlert color="danger" className="mb-3">
          {error}
        </CAlert>
      )}

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Category Name*</CFormLabel>
          <CFormInput
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel>Slug*</CFormLabel>
          <CInputGroup>
            <CFormInput
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., computer-science"
              required
            />
            <CButton
              type="button"
              color="secondary"
              onClick={generateSlug}
              disabled={!formData.name}
            >
              Generate
            </CButton>
          </CInputGroup>
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
            placeholder="Category description..."
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Icon Class/URL</CFormLabel>
          <CFormInput
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="e.g., fa fa-code or image URL"
          />
          {formData.icon && formData.icon.includes('http') ? (
            <img 
              src={formData.icon} 
              alt="Icon" 
              className="mt-2"
              style={{ maxWidth: '50px', maxHeight: '50px' }}
            />
          ) : formData.icon ? (
            <div className="mt-2">
              <i className={formData.icon} style={{ fontSize: '24px', color: formData.color }}></i>
            </div>
          ) : null}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={12}>
          <CFormCheck
            id="isActive"
            name="isActive"
            label="Active Category"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <small className="text-muted">Inactive categories won't be shown in dropdowns</small>
        </CCol>
      </CRow>
      <div className="d-flex justify-content-end gap-2 mt-4">
        <CButton color="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </CButton>
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </CButton>
      </div>
    </CForm>
  );
};

export default CourseCategoryForm;