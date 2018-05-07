'use strict';
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const errors = require('../errors');
const authHelper = require('../helpers/auth.helper');

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

    /**
     * @param {string} email
     * @param {string} password
     * @return {object} user
     */

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

    /**
     * @param {string} password
     * @return {any} hash
     */
    User.hashPassword = (password) => {
        console.log('password=', password);
        return crypto
            .createHmac('sha512', process.env.SALT || 'salt')
            .update(password)
            .digest('hex');
    };

    User.sendCode = async (email, password) => {
        console.log('send');
        let user = await User.findOne({
            where: {email: email},
        });
        if (!user) throw errors.NotFoundError('User not found!');
        if (!user.password) throw errors.NotAllowedError('Password not set! Please contact support.');
        if (user.password !== User.hashPassword(password)) throw errors.UnauthorizedError('Invalid credentials');

        authHelper.sendCode(user);
        return user;


    }

    /**
     * Generate Authentication Token for user
     * @return {{type: string, expiresIn: *, accessToken: *}}
     */
    User.prototype.generateToken = async function () {
        const salt = process.env.SALT || 'salt';
        const data = {
            userId: this.uuid,
            userRole: this.userRole,
        };

        const tokenLifeTime = process.env.TOKEN_LIFE_TIME || 600000;
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
