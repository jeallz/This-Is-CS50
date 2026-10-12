const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Stock = sequelize.define("stock", {
    discord_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        primaryKey: true
    },
    pet_food: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    premium_pet_food: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    gourmet_pet_food: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    chicken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    fillet: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: "stock",
    timestamps: false,
});

module.exports = Stock;