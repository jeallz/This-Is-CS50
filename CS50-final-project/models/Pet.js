const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Pets = sequelize.define("pets", {
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    discord_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        primaryKey: true,
    },
    species: {
        type: DataTypes.ENUM("Dog", "Cat", "Snake"),
        allowNull: true,
        defaultValue: null
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    happiness: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    hunger: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_played: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
});

module.exports = Pets;