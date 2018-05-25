'use strict';
const models = require('../models');
const defaultAdmin = {
  uuid: '6F9619FF-8B86-D011-B42D-00C04FC9646F',
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
  role: 'admin'
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await models.User.create(defaultAdmin);
  },

  down: async (queryInterface, Sequelize) => {
    const admin = await models.User.findOne({where: {email: 'admin'}});
    await admin.destroy();
  }
};
