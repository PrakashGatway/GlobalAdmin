// services/pageService.js
import api from './apiService'

const pageService = {
  getAllPages: async (params) => {
    try {
      const response = await api.get('/page-information', { params })
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },

  getPageById: async (id) => {
    try {
      const response = await api.get(`/page-information/${id}`)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },

  getPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/page-information/slug/${slug}`)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },

  createPage: async (data) => {
    try {
      const response = await api.post('/page-information', data)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },

  updatePage: async (id, data) => {
    try {
      const response = await api.put(`/page-information/${id}`, data)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },

  deletePage: async (id) => {
    try {
      const response = await api.delete(`/page-information/${id}`)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message
    }
  },
}

export default pageService