const { DataTypes } = require('sequelize');
const { db } = require('../DB.config/db');

const RideModel = db.define('Ride', {
    pickupLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userInformation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'available'
    },
    driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    fare: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    rideDate: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});

module.exports = { RideModel };