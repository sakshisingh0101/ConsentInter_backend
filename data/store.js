// Mock Apps Data
export const MOCK_APPS = [
    {
        id: "app_1",
        name: "GameX - Ultimate Battle",
        category: "Game",
        icon: "Gamepad",
        requestedPermissions: ["Microphone", "Contacts", "Location", "Storage"],
        policyKeywords: ["advertising", "share with partners", "retain data", "analytics"],
        description: "The ultimate battle game for mobile.",
    },
    {
        id: "app_2",
        name: "PhotoEditor Pro",
        category: "Photography",
        icon: "Camera",
        requestedPermissions: ["Camera", "Storage", "Location"],
        policyKeywords: ["user content", "enhance photos", "location tag"],
        description: "Edit your photos like a pro.",
    },
    {
        id: "app_3",
        name: "Flashlight Utility",
        category: "Tools",
        icon: "Flashlight",
        requestedPermissions: ["Camera", "Contacts", "Location"],
        policyKeywords: ["advertising", "tracking", "3rd party share"],
        description: "Simple flashlight app.",
    },
    {
        id: "app_4",
        name: "Secure Notes",
        category: "Productivity",
        icon: "Notebook",
        requestedPermissions: ["Storage"],
        policyKeywords: ["encrypted", "local only"],
        description: "Keep your notes safe.",
    },
];

// In-memory simulation state
export const installedApps = []; // { appId, installDate, activeParams, ... }
export const timelineEvents = []; // { id, appId, date, type, description, severity }

// Helper to reset simulation (optional)
export function resetSimulation() {
    installedApps.length = 0;
    timelineEvents.length = 0;
}
