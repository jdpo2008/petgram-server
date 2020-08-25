require("dotenv").config();
const nodemailer = require("nodemailer");
const user_name = "jdpo2008@gmail.com";
const template = require("./email-template");

const sendEmail = (data) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
  });
  transporter.on("token", (token) => {
    console.log("A new access token was generated");
    console.log("User: %s", token.user);
    console.log("Access Token: %s", token.accessToken);
    console.log("Expires: %s", new Date(token.expires));
  });
  // setup e-mail data with unicode symbols
  const mailOptions = {
    from: user_name,
    to: `${data.email}`,
    subject: "Email Verification ✔",
    html: `${template(data)}`,

    auth: {
      user: user_name,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
      expires: 1494388182480,
    },
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    } else {
      console.log("Message sent: " + info);
    }
  });
};
module.exports = { sendEmail };
