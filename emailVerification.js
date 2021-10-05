const nodemailer = require("nodemailer");
require("dotenv").config();

function emailVerification(token, email) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  let mailDetails = {
    from: "goodriver399@gmail.com",
    to: `${email}`,
    subject: "Google Drive: Two step verification",
    text: `click on the link to verify account
    http://localhost:8080/register/confirmation/${token}`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
      return err;
    } else {
      console.log("email sent");
      return "1";
    }
  });
}

function resetPassword(token, email) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });


  let mailDetails = {
    from: "goodriver399@gmail.com",
    to: `${email}`,
    subject: "Google Drive: Reset Password",
    text: `click on the link to reset password
       http://localhost:8080/forgetpassword/resetpassword/${token}`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
      return err;
    } else {
      console.log("email sent");
      return "1";
    }
  });
}

module.exports = { emailVerification, resetPassword };
