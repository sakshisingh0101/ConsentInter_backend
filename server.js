import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

const allowedOriginsString = process.env.CORS_ORIGIN;
const allowedOrigins = allowedOriginsString ? allowedOriginsString.split(',').map(s => s.trim()) : [];

// Add production frontend URL and local dev URLs explicitly for POC
const trustedOrigins = [
    "https://consent-intel.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
];

const allAllowedOrigins = [...new Set([...allowedOrigins, ...trustedOrigins])];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allAllowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
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
