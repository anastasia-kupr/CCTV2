'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('users', 'two_factor_auth', {
          type: Sequelize.BOOLEAN,
          field: 'two_factor_auth',
          default: false
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'two_factor_auth');
  }
};
