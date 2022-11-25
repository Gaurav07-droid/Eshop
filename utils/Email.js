const nodemailer = require('nodemailer');
const pug = require('pug');
const htmToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Gaurav Bhardwaj<${process.env.Email_From}}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.Email_host,
      port: process.env.Email_port,
      auth: {
        user: process.env.Auth_Email,
        pass: process.env.Auth_Pass,
      },
    });
  }

  send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmToText.fromString(html),
    };

    this.newTransport().sendMail(mailOptions);
  }

  sendWelcome() {
    this.send(
      'welcome',
      `  welcome to Eshop24! let's start saving from today `
    );
  }

  sendPassToken() {
    this.send(
      'passwordReset',
      'Your Reset password token (valid for 10 minutes only)'
    );
  }
};
