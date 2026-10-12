const { Sequelize } = require("sequelize");

const dotenv = require('dotenv')

dotenv.config()
const { DB_USER, DB_PASSWORD } = process.env

const sequelize = new Sequelize(
    "kwanzaa",
    DB_USER,
    DB_PASSWORD,
    {
        host: "localhost",
        dialect: "mysql",
        logging: false
    }
);

module.exports = sequelize;