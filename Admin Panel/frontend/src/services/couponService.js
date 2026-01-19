import apiService from './apiService'

export const couponService = {
  // Get all coupons
  getCoupons: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/coupons?${queryString}` : '/coupons'
    return apiService.get(endpoint)
  },

  // Get single coupon
  getCoupon: async (id) => {
    return apiService.get(`/coupons/${id}`)
  },

  // Validate coupon code
  validateCoupon: async (code, amount, itemId, itemType) => {
    return apiService.post('/coupons/validate', {
      code,
      amount,
      itemId,
      itemType,
    })
  },

  // Create coupon
  createCoupon: async (couponData) => {
    return apiService.post('/coupons', couponData)
  },

  // Update coupon
  updateCoupon: async (id, couponData) => {
    return apiService.put(`/coupons/${id}`, couponData)
  },

  // Delete coupon
  deleteCoupon: async (id) => {
    return apiService.delete(`/coupons/${id}`)
  },
}

export default couponService
