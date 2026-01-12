import apiService from './apiService'

export const uploadService = {
  // Upload image
  uploadImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const token = localStorage.getItem('token')
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image')
    }

    return data
  },

  // Delete image
  deleteImage: async (publicId) => {
    return apiService.delete(`/upload/image/${publicId}`)
  },
}

export default uploadService
