// controllers/userController.js
const db = require("../models/db");
const { validationResult } = require("express-validator");

// --- Register User ---
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, password, aadhar_no, blockchain_id } = req.body;
    console.log("Incoming registration data:", req.body);

    const [existingUsers] = await db.promise().query(
      "SELECT * FROM users WHERE phone = ? OR aadhar_no = ?",
      [phone, aadhar_no]
    );

    if (existingUsers.length > 0) {
      console.log("Duplicate user found:", existingUsers);
      return res.status(400).json({ error: "User already exists" });
    }

    const bid =
      blockchain_id ||
      `BID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await db.promise().query(
      "INSERT INTO users (name, phone, password, aadhar_no, blockchain_id, verified) VALUES (?, ?, ?, ?, ?, 1)",
      [name, phone, password, aadhar_no, bid]
    );

    console.log("User registered successfully:", bid);
    res.json({ message: "User registered successfully", blockchain_id: bid });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// --- Login (User/Admin) ---
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { blockchain_id, phone, email, password } = req.body;

    if (email) {
      // Admin login
      const [admins] = await db.promise().query(
        "SELECT * FROM admins WHERE email = ? AND password = ?",
        [email, password]
      );

      if (admins.length === 0) return res.status(401).json({ error: "Invalid admin credentials" });

      const admin = admins[0];
      return res.json({ name: admin.name, role: "admin", email: admin.email });

    } else {
      // User login
      if (!blockchain_id && !phone) return res.status(400).json({ error: "Missing credentials" });

      const query = blockchain_id
        ? "SELECT * FROM users WHERE blockchain_id = ?"
        : "SELECT * FROM users WHERE phone = ?";
      const params = blockchain_id ? [blockchain_id] : [phone];

      const [users] = await db.promise().query(query, params);

      if (users.length === 0) return res.status(401).json({ error: "User not found" });

      const user = users[0];
      if (user.password !== password) return res.status(401).json({ error: "Invalid password" });

      return res.json({
        name: user.name,
        role: "user",
        blockchain_id: user.blockchain_id,
        phone: user.phone,
        aadhar_no: user.aadhar_no,
      });
    }

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// --- Get User Profile ---
exports.getProfile = async (req, res) => {
  try {
    const { blockchain_id } = req.params;
    if (!blockchain_id) return res.status(400).json({ error: "Blockchain ID is required" });

    const [users] = await db.promise().query(
      "SELECT name, phone, aadhar_no, blockchain_id FROM users WHERE blockchain_id = ?",
      [blockchain_id]
    );

    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(users[0]);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
