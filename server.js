import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
const allowedOriginsString = process.env.CORS_ORIGIN;
const allowedOrigins = allowedOriginsString ? allowedOriginsString.split(',').map(s => s.trim()) : [];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Consent Intelligence API is running.");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
