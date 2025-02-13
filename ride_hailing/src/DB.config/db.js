const { Sequelize, DataTypes } = require('sequelize');
require("dotenv").config();

// Create a new Sequelize instance
const db = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: "postgres",
        logging: false
    }
);

const connectDB = async () => {
    try {
        await db.authenticate();
        console.log("Database connection established successfully");

        // Sync models with the database
        await db.sync(); // Ensure models are created/updated
        console.log("Database synced");
    } catch (error) {
        console.log("Unable to connect to database:", error);
    }
};


module.exports = { db, connectDB };





