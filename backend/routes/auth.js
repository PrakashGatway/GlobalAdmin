const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  register,
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
} = require('../controllers/authController')

// Routes
router.post('/register', register)
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)

module.exports = router
