const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"AI Course Studio" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your AI Course Studio account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; background: #010208; color: white; padding: 40px; border-radius: 16px;">
        <h2 style="color: #6366f1;">Welcome to AI Course Studio! 🎓</h2>
        <p style="color: #9ca3af;">Click the button below to verify your email and start learning.</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #6366f1; color: white; border-radius: 12px; text-decoration: none; font-weight: bold;">
          Verify My Email
        </a>
        <p style="color: #4b5563; margin-top: 24px; font-size: 12px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };