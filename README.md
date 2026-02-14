# Consent Intelligence Dashboard - Backend

This is the backend server for the Consent Intelligence Dashboard. It provides REST API endpoints for simulated app installations, risk assessments, and event logging.

## Features
- **Express.js API**: Handles routes for app data, risk previews, and events.
- **In-Memory Store**: Uses a simple in-memory data store for the POC (no database required).
- **Risk Evaluation**: Rule-based logic to assess app permissions against categories and policy keywords.
- **CORS Configured**: Ready to serve frontend requests securely.

## Prerequisites
- Node.js (v14+ recommended)
- npm

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   - Create a `.env` file in the `server` directory.
   - Configure the port and CORS origin:
     ```env
     PORT=5000
     CORS_ORIGIN=http://localhost:5173,https://consent-intel.vercel.app
     ```
     *(Note: Update `CORS_ORIGIN` with your frontend URL)*

## Running Locally

Start the development server with live reloading:
```bash
npm run dev
```

Or start normally:
```bash
npm start
```
The server will run on `http://localhost:5000`.

## API Endpoints

- `GET /api/apps`: List mock apps available for analysis.
- `POST /api/preview-risk`: Analyze an app's risk before install.
- `POST /api/install-app`: Install an app and start monitoring.
- `POST /api/simulate-activity`: Trigger simulated runtime events (e.g., microphone access).
- `GET /api/timeline/:appId`: Get event history for an installed app.
