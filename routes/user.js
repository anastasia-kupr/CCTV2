const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');
const authenticate = require('../middleware/authenticate');

router.put('/:uuid',
    authenticate(['admin']),
    errors.wrap(async (req, res) => {
        const currentUser = res.locals.user;
        const targetUser = req.body;
        // if ((currentUser.role !== userRoles.ADMIN) && (currentUser.uuid !== targetUser.uuid)) {
        //     throw errors.Forbidden('You have no permission to');
        // }

        const existingUser = await models.User.findById(req.params.uuid);
        if (!existingUser) throw errors.NotFoundError('User not found');
        const admins = await models.User.findAll({where: {role: 'admin'}});
        if (admins.length === 1 && existingUser.role === 'admin') {
            if (targetUser.role !== userRoles.ADMIN) {
                throw errors.Forbidden('Unable to unassign last admin record.');
            }
        }
        const result = await existingUser.update(targetUser);
        res.json(result);
    })
);

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

router.get('/:uuid',
    authenticate(),
    errors.wrap(async (req, res) => {
        const user = await models.User.findById(req.params.uuid, {raw: true});
        if (!user) throw errors.NotFoundError('User not found');
        res.json(user);
    })
);

router.delete('/:uuid',
    authenticate(['admin']),
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