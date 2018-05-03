const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');
const nodemailer = require('nodemailer');

router.post('/',
    errors.wrap(async (req, res) => {

        const user = await models.User.authenticate(req.body.email, req.body.password);

        console.log('sendCode');

        let code = await models.Code.findOne({
            where: {userID: user.uuid},
        });
        if (!code) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'lisa347917@gmail.com',
                    pass: process.env.NOIIFICATION_ACCOUNT_PASSWORD,
                }
            });

            var secret = Math.round(Math.random() * 100000);
            let mailOptions = {
                from: '"CCTV support" <lisa347917@gmail.com>',
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
            code = await models.Code.create({userID: user.uuid, code: secret})
        };

        console.log('secret=', secret);

        delete user.dataValues.password;
        res.json({
            user: user
        });
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

        console.log('codeData.createdAt=', codeData.createdAt);
        if (!codeData) res.sendStatus(403);

        await codeData.destroy();

        const token = await user.generateToken();
        delete user.dataValues.password;
        res.json({
            user: user,
            token: token,
        });
    })
);

// dev router
router.get('/',
    errors.wrap(async (req, res) => {
        const User = require('../models').User;
        const user = User.create({email: 'admin', password: 'admin', role: 'admin'});
        return res.json(user);
    })
);

module.exports = router;