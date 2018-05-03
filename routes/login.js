const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');

router.post('/',
    errors.wrap(async (req, res) => {
        const user = await models.User.authenticate(req.body.email, req.body.password);
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