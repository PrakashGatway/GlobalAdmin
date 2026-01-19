import axios from 'axios'
import apiService from './apiService'

// Get API base URL (same logic as apiService)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return `http://${hostname}:5000/api`
  }
   
  return 'http://localhost:5000/api'
}

export const uploadService = {
  // Upload image
  uploadImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const token = localStorage.getItem('token')
    const API_BASE_URL = getApiBaseUrl()

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to upload image')
      }
      throw new Error(error.message || 'Failed to upload image')
    }
  },

  // Delete image
  deleteImage: async (publicId) => {
    // Encode publicId to handle special characters and slashes (e.g., "cway-admin/folder/image")
    const encodedPublicId = encodeURIComponent(publicId)
    return apiService.delete(`/upload/image/${encodedPublicId}`)
  },
}

export default uploadService
