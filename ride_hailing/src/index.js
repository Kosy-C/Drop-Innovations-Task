const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');
const { RideModel } = require('./model/rideModel');
const { matchDriver } = require("./controller/driverController");
const { db, connectDB } = require('./DB.config/db'); 

const app = express();
app.use(bodyParser.json());

// Make sure the database is connected and synced
connectDB();

app.post('/match', matchDriver);

// Validation schema using Joi
const rideSchema = Joi.object({
    pickupLocation: Joi.string().required(),
    destination: Joi.string().required(),
    userInformation: Joi.string().required()
});

// POST /rides - Create a new ride request
app.post('/rides', async (req, res) => {
    const { error } = rideSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { pickupLocation, destination, userInformation } = req.body;

    try {
        const ride = await RideModel.create({
            pickupLocation,
            destination,
            userInformation,
            status: 'available'
        });
        return res.status(201).json(ride);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to create ride request' });
    }
});

app.get('/rides', async (req, res) => {
    try {
        const rides = await RideModel.findAll({
            where: { status: 'available' }
        });
        return res.status(200).json(rides);
    } catch (err) {
        console.error('Error fetching rides:', err);
        return res.status(500).json({ error: 'Unable to fetch available rides' });
    }
});

// PATCH /rides/:id/accept - Accept a ride as a driver
app.patch('/rides/:id/accept', async (req, res) => {
    const { id } = req.params;
    try {
        const ride = await RideModel.findByPk(id);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        console.log(`Ride status: ${ride.status}`);

        if (ride.status !== 'available') {
            return res.status(400).json({ error: 'Ride already accepted or completed' });
        }

        ride.status = 'accepted';
        ride.driverId = req.body.driverId;
        await ride.save();
        return res.status(200).json(ride);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Unable to accept ride' });
    }
});

// PATCH /rides/:id/complete - Mark a ride as completed
app.patch('/rides/:id/complete', async (req, res) => {
    const { id } = req.params;
    try {
        const ride = await RideModel.findByPk(id);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }
        if (ride.status !== 'accepted') {
            return res.status(400).json({ error: 'Ride must be accepted before completing' });
        }

        ride.status = 'completed';
        await ride.save();
        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ error: 'Unable to complete ride' });
    }
});

// GET /users/:id/rides - Fetch paginated ride history for a user
app.get('/users/:id/rides', async (req, res) => {
    const { id } = req.params; // User ID
    const { page = 1, limit = 10 } = req.query; // Pagination parameters

    const offset = (page - 1) * limit; // Calculate offset for pagination

    try {
        // Fetch rides for the user, applying pagination
        const rides = await RideModel.findAndCountAll({
            where: { userInformation: id }, // Assuming userInformation stores user ID
            limit: parseInt(limit), // Number of records per page
            offset: parseInt(offset), // Skip records to implement pagination
            order: [['rideDate', 'DESC']], // Order by ride date, newest first
        });

        // Return paginated results
        return res.status(200).json({
            totalRides: rides.count, // Total number of rides
            totalPages: Math.ceil(rides.count / limit), // Total pages based on count and limit
            currentPage: parseInt(page), // Current page
            rides: rides.rows, // List of rides for the current page
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Unable to fetch ride history' });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
