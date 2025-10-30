// backend/routes/alertRoutes.js
const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

// Get all active alerts
router.get("/live", alertController.getLiveAlerts);

// Get all resolved alerts
router.get("/resolved", alertController.getResolvedAlerts);

// Create a new alert
router.post("/create", alertController.createAlert);

// Resolve an alert by ID
router.put("/resolve/:id", alertController.resolveAlert);

// Permanently delete an alert by ID
router.delete("/delete/:id", alertController.deleteAlert);

// Download alert history (CSV/JSON)
router.get("/download", alertController.downloadHistory);

// Publish an alert (admin side)
router.post("/publish/:id", alertController.publishAlert);

// Get all published alerts (user side)
router.get("/published", alertController.getPublishedAlerts);

// Send SOS alert from a user
router.post("/sos/:userId", alertController.sendSOS);

module.exports = router;
