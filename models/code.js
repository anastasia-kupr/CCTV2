'use strict';
const errors = require('../errors');

module.exports = (sequelize, Sequelize) => {
    const Code = sequelize.define('Code', {
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
    }, {
            tableName: 'codes',
            timestamps: true,
            hooks: {
                beforeValidate: async (user) => {

                },
            },
        });

    return Code;
};
