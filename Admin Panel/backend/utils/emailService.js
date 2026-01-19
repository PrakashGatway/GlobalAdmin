const nodemailer = require('nodemailer')

// Create transporter (using Gmail as example, configure with your email service)
const createTransporter = () => {
  // For development/testing, you can use Gmail or other services
  // For production, use proper SMTP configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
    // Alternative: Use SMTP directly
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT || 587,
    // secure: false,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
  })
}

// Send OTP email
const sendOTPEmail = async (email, otp, role) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cwayglobal.com',
      to: email,
      subject: 'Your Login OTP - C-way Global Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">C-way Global Admin Dashboard</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for login is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>Role: <strong>${role}</strong></p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
      text: `
        C-way Global Admin Dashboard
        
        Your One-Time Password (OTP) for login is: ${otp}
        
        This OTP is valid for 10 minutes.
        Role: ${role}
        
        If you didn't request this OTP, please ignore this email.
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('OTP Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    // For development, log OTP to console if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Email not configured. OTP for', email, 'is:', otp)
    }
    throw new Error('Failed to send OTP email')
  }
}

module.exports = {
  sendOTPEmail,
}
