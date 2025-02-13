import express from "express";
import { RegisterUser, UserLogin } from "../controller/userController";
// import { driversAuth, ridersAuth } from "../middleware/authorization";

const router = express.Router();

router.post('/signup', RegisterUser);
router.post('/login', UserLogin);

export default router;