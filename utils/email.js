const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  //service: "Gmail",
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "felicity.waters91@ethereal.email",
    pass: "EeUDr7dTA8vpSnWuXS"
  }
});

const sendVerificationEmail = async (to, url) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking on the following link: <a href="${url}">Verify Email</a></p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};
