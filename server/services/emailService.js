import nodemailer from 'nodemailer';
import config from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendOtpEmail = async (to, otp, subject = 'Verify Your Email') => {
  const mailOptions = {
    from: config.email.from,
    to: to,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2>Email Verification</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete the process.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
  }
};

export const sendWelcomeEmail = async (to, tempPassword) => {
  const mailOptions = {
    from: config.email.from,
    to: to,
    subject: 'Welcome to the Platform!',
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9fb; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #4a90e2; margin-bottom: 10px;">Welcome Aboard! 🚀</h2>
            <p style="font-size: 16px; color: #555;">Your account has been created successfully.</p>
          </div>
          <div style="font-size: 16px; line-height: 1.6; color: #444;">
            <p>An admin has registered an account for you on our platform.</p>
            <p>Here are your login credentials:</p>
            <div style="background-color: #f1f5fb; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p>⚠️ Please log in and change your password immediately from your profile settings for security reasons.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.clientUrl}/login" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #4a90e2, #007bff); color: #fff; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 16px;">
              🔐 Login Now
            </a>
          </div>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 13px; text-align: center; color: #999;">If you did not expect this email, please contact our support team.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${to}:`, error);
  }
};

export const sendNotificationEmail = async (to, subject, message) => {
  const mailOptions = {
    from: config.email.from,
    to: to,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f9; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #4a90e2;">📢 ${subject}</h2>
          </div>
          <div style="font-size: 16px; line-height: 1.6; color: #444;">
            ${message}
          </div>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 13px; text-align: center; color: #999;">This is an automated notification. Please do not reply.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending notification email:`, error);
  }
};



export const sendDocumentEmail = async (to, subject, pdfBuffer, filename) => {
  const mailOptions = {
    from: config.email.from,
    to: to,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f5f8fa; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px;">
          <h2 style="color: #4a90e2; text-align: center;">📎 Document Attached</h2>
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Hello,
          </p>
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Please find the requested document attached to this email. The file is in PDF format.
          </p>
          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            If you have any questions or require further assistance, feel free to contact our administration team.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <span style="display: inline-block; background: #e3f2fd; color: #0d47a1; padding: 10px 18px; border-radius: 6px; font-size: 14px;">
              Attached: <strong>${filename}</strong>
            </span>
          </div>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 13px; text-align: center; color: #999;">This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Document email sent to ${to}`);
  } catch (error) {
    console.error('Error sending document email:', error);
  }
};
