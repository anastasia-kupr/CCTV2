const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');
const authenticate = require('../middleware/authenticate');

router.post('/',
    authenticate(['admin']),
    errors.wrap(async (req, res) => {
        const existingUser = await models.User.findOne({where: {email: req.body.email}});
        if (existingUser) throw errors.InvalidInputError('User with same email already exists');
        const user = req.body;
        const result = await models.User.create(user);
        res.status(200).json(result.dataValues);
    })
);

router.put('/:uuid',
    authenticate(),
    errors.wrap(async (req, res) => {
        const currentUser = res.locals.user;
        const targetUser = req.body;

        const existingUser = await models.User.findById(req.params.uuid);
        if (!existingUser) throw errors.NotFoundError('User not found');

        if (currentUser.uuid!==existingUser.uuid && currentUser.role!=='admin') throw errors.Forbidden('You have no permission to');

        const result = await existingUser.update(targetUser);
        res.json(result);
    })
);

router.get('/:uuid',
    authenticate(),
    errors.wrap(async (req, res) => {
        console.log('router.get(/:uuid');
        const user = await models.User.findById(req.params.uuid, {raw: true});
        if (!user) throw errors.NotFoundError('User is not found');
        res.json(user);
    })
);

router.delete('/:uuid',
    // authenticate(['admin']),
    errors.wrap(async (req, res) => {
        const admins = await models.User.findAll({where: {role: 'admin'}});
        const user = await models.User.findById(req.params.uuid);
        if (!user) throw errors.NotFoundError('User not found');

        // prevent deleting last admin record
        if (admins.length === 1 && user.role === 'admin') throw errors.Forbidden('Unable to delete last admin record.');
        await user.destroy();
        res.sendStatus(204);
    })
);

module.exports = router;