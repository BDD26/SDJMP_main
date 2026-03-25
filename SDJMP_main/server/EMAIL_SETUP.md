# Email Configuration for Password Reset

Add these environment variables to your `.env` file:

```bash
# Email Service Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup Instructions:

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "SkillMatch"
4. Use the app password as `SMTP_PASS`

## Alternative SMTP Providers:

### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Security Notes:

- Never commit your email credentials to version control
- Use app-specific passwords, not your main password
- Enable TLS/SSL encryption in production
- Consider using a transactional email service like SendGrid or Mailgun for production
