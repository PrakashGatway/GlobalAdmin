# Email Setup Guide for OTP Functionality

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Other (Custom name)**
3. Enter name: "C-way Admin OTP"
4. Click **Generate**
5. Copy the 16-character password (no spaces)

### Step 3: Update .env File
Open `backend/.env` and update these values:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@cwayglobal.com
```

**Example:**
```env
EMAIL_USER=admin@cwayglobal.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@cwayglobal.com
```

---

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP
```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

**Note:** For custom SMTP, you'll need to update `backend/utils/emailService.js` to use SMTP configuration instead of Gmail service.

---

## Testing Email Configuration

### Method 1: Test via Login
1. Start the backend server: `npm run dev`
2. Go to login page
3. Enter email and role
4. Click "Send OTP"
5. Check your email inbox

### Method 2: Development Mode
If email is not configured, OTP will be printed in the console:
```
⚠️  Email not configured. OTP for admin@gateway.com is: 123456
```

---

## Troubleshooting

### Error: "Invalid login credentials"
- Make sure you're using **App Password**, not your regular Gmail password
- Check that 2-Factor Authentication is enabled

### Error: "Connection timeout"
- Check your internet connection
- Verify SMTP host and port are correct
- Check firewall settings

### OTP not received
- Check spam/junk folder
- Verify email address is correct
- Check console for errors
- In development mode, check console for OTP

---

## Security Notes

1. **Never commit `.env` file to Git** (already in .gitignore)
2. Use **App Passwords** instead of regular passwords
3. In production, use a dedicated email service (SendGrid, Mailgun, etc.)
4. Rotate passwords regularly

---

## Production Recommendations

For production, consider using:
- **SendGrid** - https://sendgrid.com
- **Mailgun** - https://www.mailgun.com
- **Amazon SES** - https://aws.amazon.com/ses/
- **Postmark** - https://postmarkapp.com

These services provide better deliverability and analytics.
