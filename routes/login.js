const router = require('express').Router();
const errors = require('../errors');
const jwt = require('jsonwebtoken');

let users = [
    {
        email: 'admin',
        password: 'admin',
        role: 'admin',
        firstName: 'admind',
        lastName: 'admins'
    },
    {
        email: 'user',
        password: 'user',
        role: 'user'
    }
];

var generateToken = function(user) {
    console.log('generateToken');
    const salt = process.env.SALT || 'salt';
    console.log('salt=', salt);
    const data = {
        name: user.name,
        role: user.role,
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

        // const models = res.app.get('models');
        // console.log('1111');
        // const user = await models.User.authenticate(req.body.email, req.body.password);
        // console.log('2222');
        // const token = await user.generateToken();
        // user.lastLoginAt = new Date();
        // await user.save();
        // delete user.dataValues.password;
        // res.json({
        //     user: user,
        //     token: token,
        // });
        console.log('router.post(');
        let user = users[users.findIndex((item) => item.email===req.body.email)];
        if (!user){
            res.sendStatus(403);
            return;
        }
        console.log();
        console.log('user=', user);
        console.log();
        const token = await generateToken(user);
        res.json({
            user: user,
            token: token,
        });

    })
);

router.post('/signup',
    errors.wrap(async (req, res) => {
        console.log('signup, req.body=', req.body);
        user = req.body;
        user.role = 'admin';
        users.push(user);
        console.log('users=', users);
        const token = await generateToken(user);
        res.json({
            user: user,
            token: token,
        });
    })
);

router.get('/user/:email',
    errors.wrap(async (req, res) => {
        console.log('router.get(/user');
        user = users[users.findIndex((item) => item.email===req.params.email)];
        console.log('user=', user);
        if (!user){
            res.sendStatus(404);
            return;
        }
        res.json(user);        
    })
);

router.get('/users',
    errors.wrap(async (req, res) => {
        console.log('router.get(/users');
        users.forEach((user) => delete user.password);
        res.json(users);        
    })
);

module.exports = router;