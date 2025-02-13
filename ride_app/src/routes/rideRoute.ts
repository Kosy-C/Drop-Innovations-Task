import express from "express";
import { driversAuth, ridersAuth } from "../middleware/authorization";
import { acceptRide, cancelRide, completeRide, createRide } from "../controller/rideController";

const router = express.Router();

router.post("/create-ride", ridersAuth, createRide);
router.delete("/cancel-ride/:id", ridersAuth, cancelRide);

router.put("/accept-ride/:id", driversAuth, acceptRide);
router.put("/complete-ride/:id", driversAuth, completeRide);

export default router;