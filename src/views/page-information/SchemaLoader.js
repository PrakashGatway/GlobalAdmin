// components/SchemaLoader.js
import { pageData as pageSchemas } from "../../services/apiService"

export const getPageSchema = (pageType = 'general') => {
  return pageSchemas[pageType] || pageSchemas.general
}

export const getPageTypes = () => {
  return Object.keys(pageSchemas).map(key => ({
    value: key,
    label: pageSchemas[key].name,
    description: pageSchemas[key].description
  }))
}

// Helper function to get default value based on field type
const getDefaultValue = (field) => {
  if (field.default !== undefined && field.default !== null) {
    return field.default
  }
  
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'richtext':
    case 'select':
      return ''
    case 'number':
      return 0
    case 'checkbox':
      return false
    case 'file':
      return ''
    case 'repeater':
      return []
    default:
      return ''
  }
}

// FIXED: Returns nested structure with section names as keys
export const getDefaultValues = (pageType = 'general') => {
  const schema = getPageSchema(pageType)
  const defaultValues = {}
  
  if (!schema || !schema.sections) {
    console.error('No schema found for page type:', pageType)
    return {}
  }
  
  console.log('Building default values for page type:', pageType)
  console.log('Schema sections count:', schema.sections.length)
  
  // Initialize each section with its fields and metadata
  schema.sections.forEach((section, index) => {
    // Create section object with metadata
    const sectionData = {
      __order__: index,
      __originalName__: section.name,
      __isDuplicate__: false
    }
    
    // Add all fields with their default values
    section.fields.forEach(field => {
      if (field.type === 'repeater') {
        // For repeater fields, initialize with empty array
        sectionData[field.name] = []
      } else if (field.type === 'select') {
        // For select fields, use the default value or first option
        sectionData[field.name] = field.default || (field.options && field.options[0]?.value) || ''
      } else {
        sectionData[field.name] = getDefaultValue(field)
      }
    })
    
    // Add the section to default values
    defaultValues[section.name] = sectionData
  })
  
  console.log('Generated default values sections:', Object.keys(defaultValues))
  return defaultValues
}