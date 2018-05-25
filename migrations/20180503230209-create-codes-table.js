'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('codes', {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        userID: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
            field: 'user_id',
        },
        code: {
            type: Sequelize.STRING(10),
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('codes');
  }
};
