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
            type: Sequelize.STRING(512),
            allowNull: false,
            unique: true,
            field: 'user_id',
        },
        code: {
            type: Sequelize.STRING(10),
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
        },
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('codes');
  }
};
