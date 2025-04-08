const nodemailer = require("nodemailer");
async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: "mail.courierdirect.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to: to,
    subject: subject,
    html: text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
}

module.exports = sendEmail;
