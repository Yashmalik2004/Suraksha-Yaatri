const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
// Active alerts
router.get("/live", alertController.getLiveAlerts);
// Resolved alerts
router.get("/resolved", alertController.getResolvedAlerts);
// Create alert
router.post("/create", alertController.createAlert);
// Resolve alert
router.put("/resolve/:id", alertController.resolveAlert);
// Delete alert permanently
router.delete("/delete/:id", alertController.deleteAlert);
// Full history
router.get("/history", alertController.getHistory);
// Download history
router.get("/download", alertController.downloadHistory);
module.exports = router;
