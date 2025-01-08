const generateMailBody = (user, verificationToken, type) => {
    let message = "";
    let title = "";

    if (type === "REGISTER") {
        title = "Verify Your Email";
        message = `
            <p>Hello <strong>${user.fullname}</strong>,</p>
            <p>Thank you for registering with VibeSpace! Please use the OTP code below to verify your email address:</p>
            <div class="otp-code">${verificationToken}</div>
            <p>This code is valid for <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.</p>
        `;
    } else if (type === "PASSWORDRESET") {
        title = "Reset Your Password";
        message = `
            <p>Hello <strong>${user.fullname}</strong>,</p>
            <p>You requested to reset your password. Please use the OTP code below to reset your password:</p>
            <div class="otp-code">${verificationToken}</div>
            <p>This code is valid for <strong>10 minutes</strong>. If you didn't request this action, please ignore this email.</p>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          /* General Reset */
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            line-height: 1.6;
          }
          .email-container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .otp-code {
            display: inline-block;
            background-color: #f8f9fa;
            border: 1px solid #007bff;
            color: #007bff;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 10px 20px;
            margin: 20px auto;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666666;
            padding: 10px 20px;
            background-color: #f4f4f4;
            border-top: 1px solid #ddd;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">VibeSpace</div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p>&copy; 2024 VibeSpace. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@vibespace.com">Contact Support</a></p>
          </div>
        </div>
      </body>
    </html>
    `;
};

export  { generateMailBody };
