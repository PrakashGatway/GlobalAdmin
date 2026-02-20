// services/notificationService.js
import api from './apiService' // Your configured axios instance

const notificationService = {
  // Fetch notifications with pagination & filters
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications/admin', { params })
    return response
  },

  // Send to single user
  sendToUser: async (payload) => {
    const response = await api.post('/notifications/send/user', payload)
    return response
  },

  // Send to multiple users
  sendToUsers: async (payload) => {
    const response = await api.post('/notifications/send/bulk', payload)
    return response
  },

  // Send global notification
  sendGlobal: async (payload) => {
    const response = await api.post('/notifications/send/global', payload)
    return response
  },


  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/admin/${id}`)
    return response
  },

  // Toggle read status
  toggleReadStatus: async (recipientId, isRead) => {
    const response = await api.patch(`/admin/notifications/${recipientId}/read`, { isRead })
    return response
  },

  // Get notification stats
  getNotificationStats: async () => {
    const response = await api.get('/admin/notifications/stats')
    return response
  }
}

export default notificationService