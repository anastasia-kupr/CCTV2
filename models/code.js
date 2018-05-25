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
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
            field: 'user_id',
        },
        code: {
            type: Sequelize.STRING(10),
        }
    }, {
            tableName: 'codes',
            timestamps: false,
            hooks: {
                beforeValidate: async (user) => {

                },
            },
        });

    return Code;
};
