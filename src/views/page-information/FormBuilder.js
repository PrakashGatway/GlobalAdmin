// components/DynamicFormBuilder.jsx
import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilArrowTop, cilArrowBottom, cilCopy, cilMenu, cilWarning, cilReload } from '@coreui/icons'
import uploadService from '../../services/uploadService'
import TinyEditor from './Editor'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const uploadFile = async (file) => {
  if (!file) return null

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file')
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image size must be < 2MB')
  }

  const res = await uploadService.uploadImage(file)
  if (res.success) {
    return res.data.url
  }
  throw new Error('Upload failed')
}

const SortableSection = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '1rem',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ dragHandleProps: listeners, isDragging })}
    </div>
  )
}

const DynamicFormBuilder = ({
  schema, // Original JSON schema - NEVER modified
  formData, // Page content from backend
  onChange,
  onError,
  onSectionsUpdate, // Callback when sections order/duplication changes
  loading = false
}) => {
  const [errors, setErrors] = useState({})
  const [sections, setSections] = useState([]) // Combined sections with order
  const [expandedSections, setExpandedSections] = useState([])
  const [sectionToDelete, setSectionToDelete] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  console.log(schema)
  // Build sections from schema and formData
  // In DynamicFormBuilder.jsx, update the useEffect
  useEffect(() => {
    if (!schema?.sections) return

    let existingSections = []

    // Check if we have formData with sections
    const hasFormDataSections = formData && Object.keys(formData).length > 0 &&
      Object.keys(formData).some(key => formData[key]?.__order__ !== undefined)

    if (hasFormDataSections) {
      // CASE 1: We have existing formData (editing existing page)
      console.log('Building from existing formData')
      existingSections = Object.keys(formData).map(sectionName => {
        // Find the original schema section
        const originalSchemaSection = schema.sections.find(s => s.name === sectionName.split('_copy_')[0])

        if (originalSchemaSection) {
          return {
            id: sectionName,
            name: sectionName,
            label: sectionName.includes('_copy_') ? `${originalSchemaSection.label} (Copy)` : originalSchemaSection.label,
            isDuplicate: sectionName.includes('_copy_'),
            originalName: sectionName.split('_copy_')[0],
            order: formData[sectionName]?.__order__ || 0,
            fields: originalSchemaSection.fields.map(field => ({
              ...field,
              value: formData[sectionName]?.[field.name] ?? field.default ?? ''
            }))
          }
        }
        return null
      }).filter(Boolean)
    } else {
      // CASE 2: No formData (creating new page) - build from schema
      console.log('Building sections from schema for new page')
      console.log('Schema sections count:', schema.sections.length)

      existingSections = schema.sections.map((section, index) => {
        console.log(`Creating section: ${section.name} with ${section.fields.length} fields`)
        return {
          id: section.name,
          name: section.name,
          label: section.label,
          isDuplicate: false,
          originalName: section.name,
          order: index,
          fields: section.fields.map(field => ({
            ...field,
            value: field.default !== undefined ? field.default : ''
          }))
        }
      })
    }

    // Sort by order
    existingSections.sort((a, b) => (a.order || 0) - (b.order || 0))

    console.log('Total sections built:', existingSections.length)
    console.log('Section names:', existingSections.map(s => s.name))

    setSections(existingSections)

    // Set expanded sections if empty
    if (expandedSections.length === 0 && existingSections.length > 0) {
      setExpandedSections([existingSections[0].id])
    }
  }, [schema, formData])

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

  const handleChange = (sectionId, fieldName, value) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const field = schema.sections
      .find(s => s.name === section.originalName)
      ?.fields.find(f => f.name === fieldName)

    if (!field) return

    const error = validateField(field, value)

    setErrors(prev => ({
      ...prev,
      [`${sectionId}.${fieldName}`]: error
    }))

    if (error && onError) {
      onError(fieldName, error)
    }

    // Update the value in the section
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          fields: s.fields.map(f => {
            if (f.name === fieldName) {
              return { ...f, value }
            }
            return f
          })
        }
      }
      return s
    })

    setSections(updatedSections)

    // Notify parent of the change
    if (onChange) {
      onChange(sectionId, fieldName, value)
    }
  }

  const getNextOrder = () => {
    const maxOrder = Math.max(...sections.map(s => s.order || 0), 0)
    return maxOrder + 1
  }

  const handleDuplicateSection = (sectionToDuplicate) => {
    const newSectionId = `${sectionToDuplicate.originalName}_copy_${Date.now()}`
    const nextOrder = getNextOrder()

    // Create new section from original schema but with copied data
    const originalSchemaSection = schema.sections.find(s => s.name === sectionToDuplicate.originalName)

    const newSection = {
      id: newSectionId,
      name: newSectionId,
      label: `${originalSchemaSection.label} (Copy)`,
      isDuplicate: true,
      originalName: sectionToDuplicate.originalName,
      order: nextOrder,
      fields: originalSchemaSection.fields.map(field => ({
        ...field,
        // Copy values from original section if they exist
        value: sectionToDuplicate.fields.find(f => f.name === field.name)?.value || field.default || ''
      }))
    }

    const updatedSections = [...sections, newSection]
    setSections(updatedSections)

    // Prepare data for backend
    const updatedFormData = {}
    updatedSections.forEach(section => {
      updatedFormData[section.id] = {
        __order__: section.order,
        __originalName__: section.originalName,
        __isDuplicate__: section.isDuplicate
      }
      section.fields.forEach(field => {
        updatedFormData[section.id][field.name] = field.value
      })
    })

    if (onSectionsUpdate) {
      onSectionsUpdate(updatedFormData, updatedSections)
    }

    // Expand the new section
    setExpandedSections(prev => [...prev, newSectionId])
  }

  const handleDeleteSection = (sectionToDelete) => {
    const updatedSections = sections.filter(s => s.id !== sectionToDelete.id)
    setSections(updatedSections)
    setExpandedSections(prev => prev.filter(id => id !== sectionToDelete.id))

    // Prepare data for backend
    const updatedFormData = {}
    updatedSections.forEach(section => {
      updatedFormData[section.id] = {
        __order__: section.order,
        __originalName__: section.originalName,
        __isDuplicate__: section.isDuplicate
      }
      section.fields.forEach(field => {
        updatedFormData[section.id][field.name] = field.value
      })
    })

    if (onSectionsUpdate) {
      onSectionsUpdate(updatedFormData, updatedSections)
    }

    setShowDeleteConfirm(false)
    setSectionToDelete(null)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id)
      const newIndex = sections.findIndex(s => s.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)

      // Update order numbers
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }))

      setSections(reorderedSections)

      // Prepare data for backend with updated order
      const updatedFormData = {}
      reorderedSections.forEach(section => {
        updatedFormData[section.id] = {
          __order__: section.order,
          __originalName__: section.originalName,
          __isDuplicate__: section.isDuplicate
        }
        section.fields.forEach(field => {
          updatedFormData[section.id][field.name] = field.value
        })
      })

      if (onSectionsUpdate) {
        onSectionsUpdate(updatedFormData, reorderedSections)
      }
    }
  }

  const renderField = (section, field) => {
    const value = field.value || ''
    const error = errors[`${section.id}.${field.name}`]

    const commonProps = {
      name: field.name,
      value: value,
      onChange: (e) => handleChange(
        section.id,
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

      case "richtext":
        return (
          <div className="position-relative">
             <TinyEditor header={false} initialValue={commonProps.value || ""} onChange={(value) => { commonProps.onChange({ target: { value } }); }}/>
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
                handleChange(section.id, field.name, selected)
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
                  handleChange(section.id, field.name, imageUrl)
                } catch (err) {
                  console.error(err)
                  alert(err.message || 'Image upload failed')
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

      case 'repeater':
        return (
          <RepeaterField
            field={field}
            value={value || []}
            onChange={(newValue) => handleChange(section.id, field.name, newValue)}
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

  if (sections.length === 0) {
    return (
      <div className="text-center py-5">
        <CSpinner />
        <div className="mt-2">Loading sections...</div>
      </div>
    )
  }

  return (
    <>
      <CCard>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <CAccordion
              activeItemKey={expandedSections[0]}
              alwaysOpen
              flush
            >
              {sections.map((section) => (
                <SortableSection key={section.id} id={section.id}>
                  {({ dragHandleProps }) => (
                    <CAccordionItem
                      itemKey={section.id}
                      visible={expandedSections.includes(section.id)}
                    >
                      <CAccordionHeader
                        onClick={() => {
                          setExpandedSections(prev =>
                            prev.includes(section.id)
                              ? prev.filter(id => id !== section.id)
                              : [...prev, section.id]
                          )
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              {...dragHandleProps}
                              className="drag-handle"
                              style={{ cursor: 'grab' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <CIcon icon={cilMenu} className="text-secondary" />
                            </div>
                            <span className="fw-semibold">
                              {section.label}
                              {section.isDuplicate && (
                                <CBadge color="info" className="ms-2" size="sm">
                                  Duplicate
                                </CBadge>
                              )}
                            </span>
                            <CBadge color="light" className="ms-2">
                              {section.fields.length} fields
                            </CBadge>
                          </div>
                          <div className="d-flex gap-1">
                            <CButton
                              size="sm"
                              color="info"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicateSection(section)
                              }}
                              disabled={loading}
                              title="Duplicate Section"
                            >
                              <CIcon icon={cilCopy} />
                            </CButton>

                            {section.isDuplicate && (
                              <CButton
                                size="sm"
                                color="danger"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSectionToDelete(section)
                                  setShowDeleteConfirm(true)
                                }}
                                disabled={loading}
                                title="Delete Section"
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            )}
                          </div>
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
                                <CFormLabel htmlFor={`${section.id}-${field.name}`}>
                                  {field.label} {field.required && <span className="text-danger">*</span>}
                                </CFormLabel>
                                {renderField(section, field)}
                                {errors[`${section.id}.${field.name}`] && (
                                  <div className="invalid-feedback d-block">
                                    {errors[`${section.id}.${field.name}`]}
                                  </div>
                                )}
                                {field.placeholder && !errors[`${section.id}.${field.name}`] && (
                                  <div className="form-text">{field.placeholder}</div>
                                )}
                              </div>
                            </CCol>
                          ))}
                        </CRow>
                      </CAccordionBody>
                    </CAccordionItem>
                  )}
                </SortableSection>
              ))}
            </CAccordion>
          </SortableContext>
        </DndContext>
      </CCard>

      <CModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        aria-labelledby="delete-section-modal"
      >
        <CModalHeader>
          <CModalTitle id="delete-section-modal">
            <CIcon icon={cilWarning} className="me-2 text-warning" />
            Delete Section
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete the section <strong>"{sectionToDelete?.label}"</strong>?</p>
          <p className="text-danger mb-0">This action cannot be undone. All data in this section will be permanently removed.</p>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={() => handleDeleteSection(sectionToDelete)}
          >
            Delete Section
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

// Repeater Field Component
const RepeaterField = ({ field, value = [], onChange, disabled }) => {
  const [items, setItems] = useState(value)

  useEffect(() => {
    setItems(value)
  }, [value])

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
                  alert(err.message || 'Image upload failed')
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
      case "richtext":
        return (
         <TinyEditor header={false} initialValue={commonProps.value || ""} onChange={(value) => { commonProps.onChange({ target: { value } }); }}/>
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
                      md={itemField.type === 'textarea' || itemField.type === 'richtext' ? 12 : 6}
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