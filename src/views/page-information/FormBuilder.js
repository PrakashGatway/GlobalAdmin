// components/DynamicFormBuilder.jsx
import React, { useState, useEffect } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CBadge,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilMinus, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import uploadService from '../../services/uploadService'

const DynamicFormBuilder = ({
  schema,
  formData,
  onChange,
  onError,
  loading = false
}) => {
  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    if (field.required && !value) {
      return `${field.label} is required`
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address'
    }
    if (field.type === 'tel' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return ''
  }

  const uploadFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image size must be < 5MB')
      return
    }
    const res = await uploadService.uploadImage(file)
    if (res.success) {
      return res.data.url
    }
  }


  const handleChange = (sectionName, fieldName, value) => {

    const error = validateField(
      schema.sections
        .find(s => s.name === sectionName)
        .fields.find(f => f.name === fieldName),
      value
    )

    setErrors(prev => ({
      ...prev,
      [`${sectionName}.${fieldName}`]: error
    }))

    if (error && onError) {
      onError(fieldName, error)
    }
    onChange(sectionName, fieldName, value)
  }

  const renderField = (sectionName, field) => {
    const value = formData[sectionName]?.[field.name] || ''
    const error = errors[`${sectionName}.${field.name}`]

    const commonProps = {
      name: field.name,
      value: value,
      onChange: (e) => handleChange(
        sectionName,
        field.name,
        field.type === 'checkbox' ? e.target.checked : e.target.value
      ),
      required: field.required,
      disabled: loading,
      invalid: !!error
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <CFormInput
            type={field.type}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            {...commonProps}
          />
        )

      case 'textarea':
        return (
          <CFormTextarea
            placeholder={field.placeholder}
            rows={field.rows || 3}
            {...commonProps}
          />
        )

      case 'richtext':
        return (
          <div className="position-relative">
            <textarea
              className="form-control"
              rows="6"
              placeholder="Enter rich text content..."
              {...commonProps}
            />
            <div className="mt-2">
              <small className="text-muted">
                Supports HTML formatting. Use &lt;b&gt;, &lt;i&gt;, &lt;ul&gt;, &lt;li&gt; tags.
              </small>
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <CFormCheck
            label={field.label}
            checked={!!value}
            {...commonProps}
          />
        )

      case 'select':
        return (
          <CFormSelect {...commonProps}>
            <option value="">Select {field.label}</option>
            {(field.options || []).map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </CFormSelect>
        )

      case 'select-multiple':
        return (
          <div>
            <CFormSelect
              multiple
              {...commonProps}
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                handleChange(sectionName, field.name, selected)
              }}
            >
              {(field.options || []).map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </CFormSelect>
            <div className="form-text">
              Hold Ctrl/Cmd to select multiple options
            </div>
          </div>
        )
      case 'file':
        return (
          <div>
            <CFormInput
              type="file"
              accept={field.accept}
              disabled={loading}
              onChange={async (e) => {
                const file = e.target.files[0]
                if (!file) return

                try {
                  const imageUrl = await uploadFile(file)
                  handleChange(sectionName, field.name, imageUrl)
                } catch (err) {
                  console.error(err)
                  alert('Image upload failed')
                }
              }}
            />

            {value && (
              <div className="mt-2">
                <img src={value} alt="preview" width="120" className="img-thumbnail" />
              </div>
            )}
          </div>
        )

      case 'file-multiple':
        return (
          <div>
            <CFormInput
              type="file"
              accept={field.accept}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files)
                handleChange(sectionName, field.name, files)
              }}
              disabled={loading}
            />
            <div className="form-text">
              Max {field.maxFiles || 5} files. Accepted: {field.accept || 'All files'}
            </div>
          </div>
        )

      case 'repeater':
        return (
          <RepeaterField
            field={field}
            value={value || []}
            onChange={(newValue) => handleChange(sectionName, field.name, newValue)}
            disabled={loading}
          />
        )

      default:
        return (
          <CFormInput
            type="text"
            placeholder={field.placeholder}
            {...commonProps}
          />
        )
    }
  }

  const renderSection = (section) => {
    return (
      <CAccordionItem key={section.name} itemKey={section.name}>
        <CAccordionHeader>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="fw-semibold">{section.label}</span>
            <CBadge color="light" className="ms-2">
              {section.fields.length} fields
            </CBadge>
          </div>
        </CAccordionHeader>
        <CAccordionBody>
          <CRow className="g-3">
            {section.fields.map((field) => (
              <CCol
                key={field.name}
                md={field.type === 'textarea' || field.type === 'richtext' || field.type === 'repeater' ? 12 : 6}
              >
                <div className="mb-3">
                  <CFormLabel htmlFor={`${section.name}-${field.name}`}>
                    {field.label} {field.required && <span className="text-danger">*</span>}
                  </CFormLabel>
                  {renderField(section.name, field)}
                  {errors[`${section.name}.${field.name}`] && (
                    <div className="invalid-feedback d-block">
                      {errors[`${section.name}.${field.name}`]}
                    </div>
                  )}
                  {field.placeholder && !errors[`${section.name}.${field.name}`] && (
                    <div className="form-text">{field.placeholder}</div>
                  )}
                </div>
              </CCol>
            ))}
          </CRow>
        </CAccordionBody>
      </CAccordionItem>
    )
  }

  return (
    <CForm>
      <CAccordion activeItemKey={schema.sections[0]?.name} alwaysOpen>
        {schema.sections.map(renderSection)}
      </CAccordion>
    </CForm>
  )
}

// Repeater Field Component for dynamic arrays
const RepeaterField = ({ field, value = [], onChange, disabled }) => {
  const [items, setItems] = useState(value)

  useEffect(() => {
    setItems(value)
  }, [value])

  
  const uploadFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image size must be < 5MB')
      return
    }
    const res = await uploadService.uploadImage(file)
    if (res.success) {
      return res.data.url
    }
  }
  const handleAddItem = () => {
    const newItem = {}
    field.fields.forEach(f => {
      newItem[f.name] = f.default || ''
    })
    const newItems = [...items, newItem]
    setItems(newItems)
    onChange(newItems)
  }

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    onChange(newItems)
  }

  const handleChange = (index, fieldName, fieldValue) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [fieldName]: fieldValue
    }
    setItems(newItems)
    onChange(newItems)
  }

  const handleMove = (index, direction) => {
    const newItems = [...items]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newItems.length) {
      const temp = newItems[index]
      newItems[index] = newItems[newIndex]
      newItems[newIndex] = temp
      setItems(newItems)
      onChange(newItems)
    }
  }

  const renderRepeaterField = (itemField, itemValue, itemIndex) => {
    const commonProps = {
      value: itemValue || '',
      onChange: (e) => handleChange(
        itemIndex,
        itemField.name,
        itemField.type === 'checkbox' ? e.target.checked : e.target.value
      ),
      disabled,
      required: itemField.required
    }

    switch (itemField.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <CFormInput
            type={itemField.type}
            placeholder={itemField.placeholder}
            {...commonProps}
          />
        )
      case 'textarea':
        return (
          <CFormTextarea
            placeholder={itemField.placeholder}
            rows={2}
            {...commonProps}
          />
        )
      case "file":
        return (
          <>
            <CFormInput
              type="file"
              accept={itemField.accept}
              onChange={async (e) => {
                const file = e.target.files[0]
                if (!file) return

                try {
                  const imageUrl = await uploadFile(file)
                  handleChange(itemIndex, itemField.name, imageUrl)
                } catch (err) {
                  console.error(err)
                  alert('Image upload failed')
                }
              }}
            />
            {itemValue && (
              <div className="mt-2">
                <img src={itemValue} alt="preview" width="120" className="img-thumbnail" />
              </div>
            )}

          </>
        )
      case 'select':
        return (
          <CFormSelect {...commonProps}>
            <option value="">Select {itemField.label}</option>
            {(itemField.options || []).map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </CFormSelect>
        )
      case 'checkbox':
        return (
          <CFormCheck
            label={itemField.label}
            checked={!!itemValue}
            {...commonProps}
          />
        )
      default:
        return (
          <CFormInput
            type="text"
            placeholder={itemField.placeholder}
            {...commonProps}
          />
        )
    }
  }

  return (
    <div className="repeater-field">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CButton
          size="sm"
          color="primary"
          variant="outline"
          onClick={handleAddItem}
          disabled={disabled}
        >
          <CIcon icon={cilPlus} className="me-1" /> Add Item
        </CButton>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-4 border rounded">
          <p className="text-muted mb-0">No items added yet</p>
        </div>
      ) : (
        <div className="repeater-items">
          {items.map((item, index) => (
            <CCard key={index} className="mb-3">
              <CCardHeader className="py-2 d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  {field.label} #{index + 1}
                </span>
                <div className="d-flex gap-1">
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={() => handleMove(index, 'up')}
                    disabled={disabled || index === 0}
                    title="Move Up"
                  >
                    <CIcon icon={cilArrowTop} />
                  </CButton>
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={() => handleMove(index, 'down')}
                    disabled={disabled || index === items.length - 1}
                    title="Move Down"
                  >
                    <CIcon icon={cilArrowBottom} />
                  </CButton>
                  <CButton
                    size="sm"
                    color="danger"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled}
                    title="Remove"
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  {field.fields.map((itemField) => (
                    <CCol
                      key={itemField.name}
                      md={itemField.type === 'textarea' ? 12 : 6}
                    >
                      <CFormLabel>
                        {itemField.label}
                        {itemField.required && <span className="text-danger">*</span>}
                      </CFormLabel>
                      {renderRepeaterField(itemField, item[itemField.name], index)}
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          ))}
        </div>
      )}
    </div>
  )
}

export default DynamicFormBuilder