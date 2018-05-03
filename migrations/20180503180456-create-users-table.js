'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('users', {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        email: {
            type: Sequelize.STRING(512),
            allowNull: false,
            unique: true,
        },
        firstName: {
            field: 'first_name',
            type: Sequelize.STRING(100),
        },
        lastName: {
            field: 'last_name',
            type: Sequelize.STRING(100),
        },
        password: {
            type: Sequelize.STRING(512),
            set: function (password) {
                this.setDataValue('password', User.hashPassword(password));
            },
        },
        role: {
            field: 'role',
            type: Sequelize.ENUM('user', 'admin'),
            default: 'user',
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
      await queryInterface.dropTable('users');
  }
};
