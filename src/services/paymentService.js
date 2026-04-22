import apiService from "./apiService";

export const paymentService = {
  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/purchases${queryString ? `?${queryString}` : ""}`);
  },

  getPaymentStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/purchases/stats${queryString ? `?${queryString}` : ""}`);
  },
  getPaymentDetails: async (purchaseId) => {
    return apiService.get(`/purchases/payments/${purchaseId}`);
  }
};

export default paymentService;