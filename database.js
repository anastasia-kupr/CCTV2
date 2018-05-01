'use strict';

const debug = require('debug')('lg:database');
const dbConfig = require('config').get('pg');
const Sequelize = require('sequelize');
const path = require('path');
const klawSync = require('klaw-sync');

debug(`Database connection string: ${dbConfig.uri}`);
const sequelize = new Sequelize(dbConfig.uri, {
    dialect: 'postgres',
    dialectOptions: {
      multipleStatements: true,
    },
    logging: dbConfig.logging ? debug : false,
});

const models = {};

const modelsPaths = klawSync(`${__dirname}/models`, {nodir: true});

modelsPaths.forEach((file) => {
    if (!require(path.resolve(__dirname, file.path))) return;
    let model = sequelize.import(path.resolve(__dirname, file.path));
    models[model.name] = model;
});

Object.keys(models).forEach((name) => {
    if ('associate' in models[name]) {
        models[name].associate(models);
    }
});

debug(`Available models: \n\t* ${Object.keys(models).join('\n\t* ')}`);

module.exports = {sequelize, models};
