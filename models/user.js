'use strict';
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const errors = require('../errors');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
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
        twoFactorAuth: {
            field: 'two_factor_auth',
            type: Sequelize.BOOLEAN,
            default: false
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
    }, {
            tableName: 'users',
            timestamps: true,
            hooks: {
                beforeValidate: async (user) => {

                },
            },
        });

    User.authenticate = async (email, password) => {
        const user = await User.findOne({
            where: {email: email},
            attributes: [...User.publicAttributes, 'password'],
        });
        if (!user) throw errors.NotFoundError('User not found!');
        if (!user.password) throw errors.NotAllowedError('Password not set! Please contact support.');
        if (user.password !== User.hashPassword(password)) throw errors.UnauthorizedError('Invalid credentials');
        return user;
    };

    User.hashPassword = (password) => {
        return crypto
            .createHmac('sha512', process.env.SALT || 'salt')
            .update(password)
            .digest('hex');
    };

    User.prototype.generateToken = async function () {
        const salt = process.env.SALT || 'salt';
        const data = {
            userId: this.uuid,
            userRole: this.userRole,
        };

        const tokenLifeTime = +process.env.TOKEN_LIFE_TIME || 600000;
        console.log('tokenLifeTime=', tokenLifeTime);
        return {
            type: 'Bearer',
            expiresIn: tokenLifeTime,
            accessToken: jwt.sign(data, salt, {expiresIn: tokenLifeTime}),
        };
    };

    User.publicAttributes = [
        ..._.without(_.keys(User.rawAttributes), 'createdAt', 'updatedAt', 'password'),
    ];

    return User;
};
