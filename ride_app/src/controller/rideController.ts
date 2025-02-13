import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { RideInstance } from "../model/rideModel";
import { CreateRideSchema, option } from "../utils/utility";
import { JwtPayload } from "jsonwebtoken"; 

export const createRide = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;
        const uuidTask = uuidv4();

        const validateResult = CreateRideSchema.validate(req.body, option);
        if (validateResult.error) {
            res.status(400).json({
                error: validateResult.error.details[0].message,
            });
        }

        // if (req.user.role !== "rider") {
        //     res.status(403).json({ message: "Only riders can create rides" });
        // }

        const existingRide = await RideInstance.findOne({ where: { id: uuidTask } });

        if (!existingRide) {
            const newRide = await RideInstance.create({
                id: uuidTask,
                riderId: req.user.id,
                status: "pending",
            });

            res.status(201).json({
                message: "Ride created successfully",
                ride: newRide,
            });
        }

        res.status(400).json({
            error: "Ride already exists!",
        });

    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            details: err,
            route: "/create-ride",
        });
    }
};

export const cancelRide = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params; 

        if (req.user.role !== "rider") {
            res.status(403).json({ message: "Only riders can cancel rides" });
        }

        const ride = await RideInstance.findOne({
            where: { id, riderId: req.user.id },
        });

        if (!ride) {
            res.status(404).json({ message: "Ride not found or unauthorized" });
            return;
        }

        await ride.update({ status: 'cancelled' });

        res.status(200).json({ 
            message: "Ride cancelled successfully", 
            ride 
        });

    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            details: err,
            route: "/cancel-ride",
        });
    }
};

export const acceptRide = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.user.role !== "driver") {
            res.status(403).json({ message: "Only drivers can accept rides" });
        }

        const ride = await RideInstance.findOne({
            where: { id, status: "pending" },
        });

        if (!ride) {
            res.status(404).json({ message: "Ride not found or already accepted" });
            return;
        }

        await ride.update({ driverId: req.user.id, status: "accepted" });

        res.status(200).json({
            message: "Ride accepted successfully",
            ride,
        });

    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            details: err,
            route: "/accept-ride",
        });
    }
};

export const completeRide = async (req: JwtPayload, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params; 

        if (req.user.role !== "driver") {
            res.status(403).json({ message: "Only drivers can complete rides" });
        }

        const ride = await RideInstance.findOne({
            where: { id, driverId: req.user.id, status: "accepted" },
        });

        if (!ride) {
            res.status(404).json({ message: "Ride not found or unauthorized" });
            return;
        }

        await ride.update({ status: "completed" });

        res.status(200).json({
            message: "Ride completed successfully",
            ride,
        });

    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            details: err,
            route: "/complete-ride",
        });
    }
};
