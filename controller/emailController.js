const nodeMailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv').config();

let transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS
  }
});

const sendEmail = asyncHandler(async (data, req, res) => {
  let info = await transporter.sendMail({
    from: '"Forgot Password Link" <abc@gmail.com>',
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });


  console.log(info);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));

});

module.exports = sendEmail;