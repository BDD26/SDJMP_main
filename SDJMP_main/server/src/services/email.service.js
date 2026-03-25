import nodemailer from 'nodemailer'
import env from '../config/env.js'

class EmailService {
  constructor() {
    this.isConfigured = !!(env.smtpUser && env.smtpPass)
    
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      })
    }
  }

  getPasswordResetTemplate(resetLink, userName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - SkillMatch</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .title {
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 10px;
            text-align: center;
        }
        .content {
            margin-bottom: 30px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .reset-button:hover {
            opacity: 0.9;
        }
        .security-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .expiry-warning {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7L9 18L4 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="logo-text">SkillMatch</div>
            </div>
            <h1 class="title">Password Reset Request</h1>
        </div>

        <div class="content">
            <p>Hello ${userName || 'there'},</p>
            <p>We received a request to reset your password for your SkillMatch account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${resetLink}
            </p>
        </div>

        <div class="security-info">
            <p><strong>Important Security Information:</strong></p>
            <ul>
                <li>This link will expire in <span class="expiry-warning">1 hour</span> for security reasons</li>
                <li>If you didn't request this password reset, please contact our support team immediately</li>
                <li>Never share this link with anyone</li>
            </ul>
        </div>

        <div class="footer">
            <p>This is an automated message from SkillMatch. Please do not reply to this email.</p>
            <p>&copy; 2024 SkillMatch. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetLink = `${env.clientUrl}/reset-password/${resetToken}`
    
    console.log(`Attempting to send password reset email to: ${email}`)
    console.log(`Reset link: ${resetLink}`)
    console.log(`Email service configured: ${this.isConfigured}`)

    if (!this.isConfigured) {
      console.log('Email service not configured. In development, reset token:', resetToken)
      console.log('Please configure SMTP settings in .env file to send actual emails')
      return true
    }

    try {
      const mailOptions = {
        from: `"SkillMatch Support" <${env.smtpUser}>`,
        to: email,
        subject: 'Reset Your SkillMatch Password',
        html: this.getPasswordResetTemplate(resetLink, userName),
      }

      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      })

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Error sending password reset email:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        command: error.command
      })
      throw new Error(`Failed to send password reset email: ${error.message}`)
    }
  }

  async verifyConnection() {
    if (!this.isConfigured) {
      return { success: false, message: 'Email service not configured' }
    }

    try {
      await this.transporter.verify()
      return { success: true, message: 'Email service connection verified' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }
}

export default new EmailService()
