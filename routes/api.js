import express from "express";
const router = express.Router();
import { MOCK_APPS, installedApps, timelineEvents, resetSimulation } from "../data/store.js";

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Risk Calculation Logic (Pre-Install)
function calculateConsentRisk(app) {
    let score = 0;
    let reasons = [];
    let recommendation = "Safe to install.";

    // Rule 1: High-risk permissions
    const highRiskPerms = ["Microphone", "Contacts", "Location"];
    const foundHighRisk = app.requestedPermissions.filter((p) =>
        highRiskPerms.includes(p)
    );
    if (foundHighRisk.length > 0) {
        score += 30;
        reasons.push(`Requests high-risk permissions: ${foundHighRisk.join(", ")}`);
    }

    // Rule 2: Category Mismatch logic (Simplified for POC)
    // E.g., Flashlight asking for Contacts/Location
    if (app.category === "Tools" && app.requestedPermissions.includes("Contacts")) {
        score += 25;
        reasons.push(`Permission mismatch: '${app.category}' app asking for Contacts.`);
    }
    if (app.category === "Game" && app.requestedPermissions.includes("Location")) {
        score += 25;
        reasons.push(`Permission mismatch: '${app.category}' app asking for Location.`);
    }

    // Rule 3: Policy Keywords
    if (app.policyKeywords.some(p => p.includes("share with partners"))) {
        score += 20;
        reasons.push("Policy allows data sharing with 3rd parties.");
    }
    if (app.policyKeywords.some(p => p.includes("advertising"))) {
        score += 20;
        reasons.push("Data used for advertising purposes.");
    }
    if (app.policyKeywords.some(p => p.includes("retain data"))) {
        score += 15;
        reasons.push("Data retention period is indefinite/long-term.");
    }

    // Cap score at 100
    score = Math.min(score, 100);

    let level = "LOW";
    if (score > 60) level = "HIGH";
    else if (score > 30) level = "MEDIUM";

    if (level === "HIGH") recommendation = "High risk detected. Proceed with caution or deny permissions.";
    else if (level === "MEDIUM") recommendation = "Review permissions carefully before installing.";

    return { level, score, reasons, recommendation };
}


// ------------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------------

// GET /apps
router.get("/apps", (req, res) => {
    res.json(MOCK_APPS);
});

// POST /preview-risk
router.post("/preview-risk", (req, res) => {
    const { appId } = req.body;
    const app = MOCK_APPS.find((a) => a.id === appId);

    if (!app) {
        return res.status(404).json({ error: "App not found" });
    }

    const riskAnalysis = calculateConsentRisk(app);
    res.json(riskAnalysis);
});

// POST /install-app
router.post("/install-app", (req, res) => {
    const { appId } = req.body;
    const app = MOCK_APPS.find((a) => a.id === appId);

    if (!app) {
        return res.status(404).json({ error: "App not found" });
    }

    // Check if already installed
    const existing = installedApps.find(a => a.appId === appId);
    if (existing) {
        return res.json({ message: "App already installed", app: existing });
    }

    const newInstall = {
        appId,
        name: app.name,
        installDate: new Date().toISOString(),
        permissionAccessCount: 0,
        lastActive: new Date().toISOString(),
        riskScore: calculateConsentRisk(app).score // Baseline risk
    };

    installedApps.push(newInstall);

    // Add initial timeline event
    timelineEvents.push({
        id: generateId(),
        appId,
        date: new Date().toISOString(),
        type: "install",
        description: `App installed. Initial risk assessment: ${calculateConsentRisk(app).level}`,
        severity: "info"
    });

    res.json({ message: "App installed successfully", app: newInstall });
});

// GET /runtime-risk/:appId
router.get("/runtime-risk/:appId", (req, res) => {
    const { appId } = req.params;
    const installedApp = installedApps.find((a) => a.appId === appId);

    if (!installedApp) {
        return res.status(404).json({ error: "App is not installed/monitored." });
    }

    // SIMULATION LOGIC: Randomly increment access count for demo purposes
    // In a real app, this would be read from a DB updated by a background worker
    // Here we just return the current state + maybe some simulated new events if triggered via a "simulate" endpoint (not requested, but good for demo)
    // For now, return current state.

    res.json({
        riskScore: installedApp.riskScore,
        accessCount: installedApp.permissionAccessCount,
        lastActive: installedApp.lastActive
    });
});

// SIMULATION ENDPOINT: Trigger realistic runtime behavior
router.post("/simulate-activity", (req, res) => {
    const { appId, type } = req.body; // type: 'access_sensitive', 'dormant_access'
    const installedApp = installedApps.find((a) => a.appId === appId);

    if (!installedApp) return res.status(404).json({ error: "App not installed" });

    let scoreIncrease = 0;
    let eventDesc = "";
    let severity = "info";

    if (type === "access_sensitive") {
        installedApp.permissionAccessCount += 5;
        scoreIncrease = 5;
        eventDesc = "Frequent access to sensitive permission (Microphone) detected.";
        severity = "warning";
    } else if (type === "dormant_access") {
        scoreIncrease = 20;
        eventDesc = "App accessed location while running in background (Dormant Access).";
        severity = "alert";
    } else {
        installedApp.permissionAccessCount += 1;
        eventDesc = "Routine permission access.";
    }

    installedApp.riskScore = Math.min(100, installedApp.riskScore + scoreIncrease);
    installedApp.lastActive = new Date().toISOString();

    timelineEvents.push({
        id: generateId(),
        appId,
        date: new Date().toISOString(),
        type: severity === "alert" ? "unusual_access" : "permission_granted",
        description: eventDesc,
        severity
    });

    res.json({ success: true, newScore: installedApp.riskScore, event: eventDesc });
});


// GET /installed-apps
router.get("/installed-apps", (req, res) => {
    res.json(installedApps);
});

// GET /timeline/:appId
router.get("/timeline/:appId", (req, res) => {
    const { appId } = req.params;
    const events = timelineEvents
        .filter((e) => e.appId === appId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    res.json(events);
});

// GET /alerts
router.get("/alerts", (req, res) => {
    // Return all events with severity 'alert' or 'warning'
    const alerts = timelineEvents
        .filter(e => e.severity === 'alert' || e.severity === 'warning')
        .map(e => {
            const app = MOCK_APPS.find(a => a.id === e.appId);
            return { ...e, appName: app ? app.name : "Unknown App" };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(alerts);
});
// Reset
router.post("/reset", (req, res) => {
    installedApps.length = 0;
    timelineEvents.length = 0;
    res.json({ message: "Simulation reset." });
});

export default router;
