const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { registerValidation, loginValidation } = require("../validators/validators");
const db = require("../models/db"); // Make sure your db connection is exported here

// --- Register new user ---
router.post("/register", registerValidation, async (req, res) => {
  try {
    const { name, phone, aadhar_no, password, blockchain_id } = req.body;

    const sql = "INSERT INTO users (name, phone, aadhar_no, password, blockchain_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, phone, aadhar_no, password, blockchain_id], (err, result) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// --- Login user/admin ---
router.post("/login", loginValidation, userController.login);

router.get("/verify/:blockchainId", async (req, res) => {
  const { blockchainId } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT name, phone, aadhar_no, blockchain_id FROM users WHERE blockchain_id = ?",
      [blockchainId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, error: "Blockchain ID not found" });
    }

    const user = rows[0];

    const blockchainDetails = {
      blockNumber: "856743",
      transactionHash: "0x9b2f8a3c1e5d7g9h2k4l6m8n0p1q3r5s7t9u1v3w5x7y9z",
      dateGenerated: "2024-01-15",
    };

    res.json({ valid: true, userDetails: { ...user, ...blockchainDetails } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, error: "Server error" });
  }
});

module.exports = router;
