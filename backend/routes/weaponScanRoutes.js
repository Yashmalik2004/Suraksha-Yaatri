const express = require("express");
const router = express.Router();
const { startWeaponScan, stopWeaponScan } = require("../controllers/weaponController");

// Start weapon detection scan
router.post("/weapon-scan", startWeaponScan);

// Stop weapon detection scan
router.post("/stop-scan", stopWeaponScan);

module.exports = router;
