const haversine = require('../utils/haversine');
const { DriverModel } = require('../model/driverModel');  // Assuming you have a Driver model

// Function to match rider with nearest available driver
const matchRiderWithDriver = (riderLocation, driverLocations) => {
    let nearestDriver = null;
    let minDistance = Infinity;

    driverLocations.forEach((driver) => {
        // Skip if the driver is not available
        if (driver.status !== 'available') return;

        const distance = haversine(
            riderLocation.lat,
            riderLocation.lon,
            driver.location.lat,
            driver.location.lon
        );

        // Update if this driver is closer than the previous one
        if (distance < minDistance) {
            minDistance = distance;
            nearestDriver = driver;
        }
    });

    if (!nearestDriver) {
        return { error: 'No available drivers found' };
    }

    return { driverId: nearestDriver.id, distance: minDistance };
};

// POST /match - Match rider with the nearest available driver
const matchDriver = async (req, res) => {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const drivers = await DriverModel.findAll({ where: { status: 'available' } });
        const result = matchRiderWithDriver({ lat, lon }, drivers);
        
        if (result.error) {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            driverId: result.driverId,
            distance: result.distance.toFixed(2), // Distance in kilometers
        });
    } catch (err) {
        return res.status(500).json({ error: 'Unable to match rider with driver' });
    }
};

module.exports = { matchDriver };
