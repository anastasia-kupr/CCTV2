const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');
const nodemailer = require('nodemailer');

router.post('/',
    errors.wrap(async (req, res) => {
        console.log('login');

        const user = await models.User.authenticate(req.body.email, req.body.password);

        if (!user.twoFactorAuth) {
            const token = await user.generateToken();
            delete user.dataValues.password;
            res.json({
                user: user,
                token: token,
            });
            return;
        }

        let code = await models.Code.findOne({
            where: {userID: user.uuid},
        });
        if (code) {
            throw errors.UnauthorizedError('Authentification error.');
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SUPPORT_ACCOUNT_EMAIL,
                pass: process.env.SUPPORT_ACCOUNT_PASSWORD,
            }
        });

        var secret = Math.round(Math.random() * 100000);
        let mailOptions = {
            from: `"CCTV support"  ${process.env.SUPPORT_ACCOUNT_EMAIL}`,
            to: `${user.email}, ${user.email}`,
            subject: 'Authorization code',
            html: `<div>Hello, <b>${user.firstName} ${user.lastName}</b></div><div>Your code: <b>${secret}</b></div>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
        code = await models.Code.create({userID: user.uuid, code: secret});
        res.json({});
    })
);


router.post('/:code',
    errors.wrap(async (req, res) => {

        const user = await models.User.authenticate(req.body.email, req.body.password);
        const code = req.params.code;
        const codeData = await models.Code.findOne({
            where: {
                user_id: user.uuid,
                code: req.params.code
            },
        });

        if (!codeData) {
            throw errors.UnauthorizedError('Authentification error.');
            return;
        }

        await codeData.destroy();

        const token = await user.generateToken();
        delete user.dataValues.password;
        res.json({
            user: user,
            token: token,
        });
    })
);

module.exports = router;