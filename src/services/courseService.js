import apiService from './apiService'

export const courseService = {
  // Get all courses
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/courses${queryString ? `?${queryString}` : ''}`)
  },

  // Get single course
  getCourse: async (id) => {
    return apiService.get(`/courses/${id}`)
  },

  // Create course
  createCourse: async (courseData) => {
    return apiService.post('/courses', courseData)
  },

  // Update course
  updateCourse: async (id, courseData) => {
    return apiService.put(`/courses/${id}`, courseData)
  },

  // Delete course
  deleteCourse: async (id) => {
    return apiService.delete(`/courses/${id}`)
  },
}

export default courseService
