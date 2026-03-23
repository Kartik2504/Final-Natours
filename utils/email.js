const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // For Gmail: activate "less secure app" option in Gmail settings
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Natours <noreply@natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html  // can add HTML version
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
