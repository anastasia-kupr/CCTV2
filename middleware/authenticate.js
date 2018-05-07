'use strict';
const jwt = require('jsonwebtoken');
const errors = require('../errors');

module.exports = function authenticate(roles) {
    return errors.wrap(async function (req, res, next) {
        const models = require('../models');

        if (!('authorization' in req.headers)) return res.status(403).send('Missing authorization header');
        const token = req.headers['authorization'].split(' ')[1];
        let payload;

        try {
            payload = jwt.verify(token, process.env.SALT || 'salt');
        } catch (err) {
            throw errors.UnauthorizedError(err.name);
        }
        const user = await models.User.findById(payload.userId);
        if (!user) throw errors.UnauthorizedError('User not found');
        if (roles && !roles.includes(user.role)) throw errors.Forbidden('You have no permission to');

        res.locals.user = user;
        next();
    });
};
