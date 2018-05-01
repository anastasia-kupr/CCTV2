const router = require('express').Router();
const errors = require('../errors');
const jwt = require('jsonwebtoken');

var generateToken = function(user) {
    console.log('generateToken');
    const salt = process.env.SALT || 'salt';
    console.log('salt=', salt);
    const data = {
        userId: user.name,
        userRole: user.email,
    };

    const tokenLifeTime = process.env.TOKEN_LIFE_TIME || 600000;
    console.log('tokenLifeTime=', tokenLifeTime);
    return {
        type: 'Bearer',
        expiresIn: tokenLifeTime,
        accessToken: jwt.sign(data, salt, {expiresIn: tokenLifeTime}),
    };
}

router.post('/',
    errors.wrap(async (req, res) => {
        console.log('router.post(');
        const models = res.app.get('models');
        const user = {
            email: req.body.email,
            password: req.body.password,
            role: 'admin'
        }
        // const user = await models.User.authenticate(req.body.email, req.body.password);
        console.log();
        console.log('user=', user);
        console.log();
        const token = await generateToken(user);
        // user.lastLoginAt = new Date();
        // await user.save();
        // delete user.dataValues.password;
        res.json({
            user: user,
            token: token,
        });

    })
);

module.exports = router;