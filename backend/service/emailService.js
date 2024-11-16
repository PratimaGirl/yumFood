const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // use your email provider
    auth: {
      user: 'singhpratima1703@gmail.com', // email to send from
      pass: 'iugx tilq puze latq', // app password or regular password
    },
  });

module.exports = {
    transporter
}