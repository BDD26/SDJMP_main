# Email Setup and Testing Guide

## Quick Setup

1. **Create your .env file:**
```bash
cp .env.example .env
```

2. **Configure email settings in .env:**
```bash
# For Gmail (Recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" for the app
4. Generate a 16-character password
5. Use this password as `SMTP_PASS`

## Testing

### 1. Check Email Configuration
```bash
curl http://localhost:5000/api/auth/verify-email
```

### 2. Test Password Reset (with existing user)
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### 3. Check Server Logs
Look for these messages in your server console:
- `Attempting to send password reset email to: email@example.com`
- `Email sent successfully: messageId`
- `Password reset link for email@example.com: http://localhost:3000/reset-password/token`

## Alternative Email Providers

### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid (Production Recommended):
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Troubleshooting

1. **"Email service not configured"** - Add SMTP credentials to .env
2. **"Invalid login"** - Check email/password or use app password for Gmail
3. **"Connection timeout"** - Check firewall and SMTP settings
4. **"535 Authentication failed"** - Use app password instead of regular password

## Development Mode

If no SMTP credentials are configured, the system will:
- Log the reset token in console
- Show the reset link in server logs
- Allow testing without email setup
