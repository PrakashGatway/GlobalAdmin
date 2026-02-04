
// import pageSchemas from './pages.json'

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

export const getDefaultValues = (pageType = 'general') => {
  const schema = getPageSchema(pageType)
  const defaultValues = {}
  
  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.default !== undefined) {
        defaultValues[field.name] = field.default
      }
      if (field.type === 'repeater' && field.default) {
        defaultValues[field.name] = field.default
      }
    })
  })
  
  return defaultValues
}