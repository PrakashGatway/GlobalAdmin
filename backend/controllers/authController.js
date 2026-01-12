const jwt = require('jsonwebtoken')
const User = require('../models/User')
const OTP = require('../models/OTP')
const { sendOTPEmail } = require('../utils/emailService')

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email and role' })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' })
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This account has role: ${user.role}, but you selected: ${role}`,
      })
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete any existing OTPs for this email and role
    await OTP.deleteMany({ email, role, isUsed: false })

    // Create new OTP
    const otp = await OTP.create({
      email,
      otp: otpCode,
      role,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, role)
    } catch (emailError) {
      // If email fails in development, still return success with OTP in response
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'OTP sent successfully (check console for OTP)',
          otp: otpCode, // Only in development
        })
      }
      throw emailError
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body

    if (!email || !otp || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP, and role' })
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      role,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' })
    }

    // Mark OTP as used
    otpRecord.isUsed = true
    await otpRecord.save()

    // Get user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage, profileImagePublicId } = req.body

    // Build update object
    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (profileImagePublicId !== undefined) updateData.profileImagePublicId = profileImagePublicId

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}