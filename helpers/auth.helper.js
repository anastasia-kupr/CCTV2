// 'use strict';
// const errors = require('../errors');
// const nodemailer = require('nodemailer');
// const models = require('../models');


// module.exports = {
//     async sendCode(user) {
//         console.log('sendCode');

//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'lisa347917@gmail.com',
//                 pass: process.env.NOIIFICATION_ACCOUNT_PASSWORD,
//             }
//         });

//         var secret = Math.round(Math.random() * 100000);
//         let mailOptions = {
//             from: '"CCTV support" <lisa347917@gmail.com>',
//             to: `${user.email}, ${user.email}`,
//             subject: 'Authorization code',
//             html: `<div>Hello, <b>${user.firstName} ${user.lastName}</b></div><div><b>Your code: ${secret}</b></div>`
//         };
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return console.log(error);
//             }
//             console.log('Message sent: %s', info.messageId);
//             console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//         });

//         console.log('models=', models);

//         const code = await models.Code.create({userID: user.uuid, code: secret});


//         console.log('secret=', secret);
//     }
// }

