const router = require('express').Router();
const errors = require('../errors');
const models = require('../models');

router.get('/',
    errors.wrap(async (req, res) => {
      const users = await models.User.findAll({
          attributes: [
              'uuid',
              'email',
              'firstName',
              'lastName',
              'role'
          ]
      });
      res.json(users);
    })
);

module.exports = router;