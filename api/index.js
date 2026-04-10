import dotenv from "dotenv";
dotenv.config(); // must be first — loads env vars before anything else uses them

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectWithDB } from "./config/db.js";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
app.use(express.json());
app.use(cookieParser());

connectWithDB();

app.use("", router);

app.listen(PORT, (err) => {
    if (err)
        console.log("Error starting server: " + err);
    else
        console.log("Listening on PORT: " + PORT);
});
