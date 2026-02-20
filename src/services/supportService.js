import api from './apiService';

const supportService = {
  getTickets: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== null) {
          if (key === 'dateRange') {
            if (filters.dateRange.start) queryParams.append('fromDate', filters.dateRange.start);
            if (filters.dateRange.end) queryParams.append('toDate', filters.dateRange.end);
          } else {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const response = await api.get(`/support?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await api.get(`/support/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/support', ticketData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await api.put(`/support/${id}`, ticketData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/support/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reply to ticket
  replyToTicket: async (id, description) => {
    try {
      const response = await api.put(`/support/reply/${id}`, { description });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get ticket statistics
  getTicketStats: async () => {
    try {
      const response = await api.get('/support/stats');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default supportService;