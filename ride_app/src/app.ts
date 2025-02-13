import express from 'express';
import logger from "morgan";
import { connectDB } from "./DB.config";
import userRoutes from "./routes/userRoute";
import rideRoutes from "./routes/rideRoute";

require ('dotenv').config();
const app = express();

app.use(express.json());
app.use(logger("dev"));

app.use('/user', userRoutes);
app.use('/rides', rideRoutes);

//this calls the database connection
connectDB();

const PORT = 3005;
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
});

export default app;