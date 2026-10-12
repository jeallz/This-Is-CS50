const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Users = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    discord_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
    },

    money: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },

    bank: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },

    created_at: {
        type: DataTypes.DATE,
    },

    last_daily: {
        type: DataTypes.DATE,
        allowNull: true
    },
    job: {
        type: DataTypes.ENUM("Programmer", "Designer", "Doctor", "Baker", "Professor", "Advocate", "Fisherman"),
        allowNull: true,
        defaultValue: null
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_work: {
        type: DataTypes.DATE
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }   
}, {
    timestamps: false,
});

module.exports = Users;