const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    // Create transporter only when needed and if credentials exist
    if (!this.transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      console.log('📧 Sending password reset email to:', email);
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Gmail AI Assistant" <${process.env.SMTP_USER || 'noreply@gmail-ai.com'}>`,
        to: email,
        subject: 'Reset Your Gmail AI Assistant Password',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
    }
    .content {
      background: white;
      border-radius: 6px;
      padding: 25px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #5568d3;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 15px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Gmail AI Assistant</h1>
    </div>
    
    <div class="content">
      <h2>Reset Your Password</h2>
      
      <p>Hi ${name || 'there'},</p>
      
      <p>You requested to reset your password for Gmail AI Assistant.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>.
      </div>
      
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <p>Thanks,<br>
      The Gmail AI Assistant Team</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Gmail AI Assistant. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
Hi ${name || 'there'},

You requested to reset your password for Gmail AI Assistant.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Thanks,
The Gmail AI Assistant Team
        `
      };

      // Only actually send if SMTP credentials are configured
      const transporter = this.getTransporter();
      
      if (transporter) {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        // Development mode - log instead of sending
        console.log('📝 Email would be sent (SMTP not configured):');
        console.log('To:', email);
        console.log('Reset URL:', resetUrl);
        console.log('\n⚠️  To enable email sending, add to .env:');
        console.log('SMTP_USER=your-email@gmail.com');
        console.log('SMTP_PASS=your-app-password');
        console.log('');
        return { success: true, messageId: 'dev-mode', resetUrl };
      }
      
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordChangedEmail(email, name) {
    try {
      console.log('📧 Sending password changed confirmation to:', email);
      
      const mailOptions = {
        from: `"Gmail AI Assistant" <${process.env.SMTP_USER || 'noreply@gmail-ai.com'}>`,
        to: email,
        subject: 'Your Gmail AI Assistant Password Was Changed',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
    }
    .content {
      background: white;
      border-radius: 6px;
      padding: 25px;
    }
    .success {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 12px;
      margin: 15px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Gmail AI Assistant</h1>
    </div>
    
    <div class="content">
      <h2>Password Changed Successfully</h2>
      
      <p>Hi ${name || 'there'},</p>
      
      <div class="success">
        <strong>✅ Your password has been changed successfully.</strong>
      </div>
      
      <p>If you made this change, no further action is needed.</p>
      
      <p>If you did NOT change your password, please contact support immediately at support@gmail-ai.com</p>
      
      <p>Thanks,<br>
      The Gmail AI Assistant Team</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
Hi ${name || 'there'},

Your password has been changed successfully.

If you made this change, no further action is needed.

If you did NOT change your password, please contact support immediately.

Thanks,
The Gmail AI Assistant Team
        `
      };

      const transporter = this.getTransporter();
      
      if (transporter) {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        console.log('📝 Email would be sent (SMTP not configured)');
        return { success: true, messageId: 'dev-mode' };
      }
      
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
