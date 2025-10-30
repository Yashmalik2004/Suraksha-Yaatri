const db = require("../models/db");
const fs = require("fs");
const path = require("path");

// --- Fetch live (active) alerts ---
exports.getLiveAlerts = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM alerts WHERE status = 'active' ORDER BY created_at DESC LIMIT 20");
    res.json(rows);
  } catch (err) {
    console.error(" DB error (getLiveAlerts):", err);
    res.status(500).json({ error: "Failed to fetch active alerts" });
  }
};

// --- Fetch resolved alerts ---
exports.getResolvedAlerts = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM resolved_alerts ORDER BY resolved_at DESC LIMIT 20");
    res.json(rows);
  } catch (err) {
    console.error(" DB error (getResolvedAlerts):", err);
    res.status(500).json({ error: "Failed to fetch resolved alerts" });
  }
};

// --- Resolve an alert ---
exports.resolveAlert = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query("SELECT * FROM alerts WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Alert not found" });

    const alert = rows[0];

    // Insert into resolved_alerts
    await db.promise().query(
      `INSERT INTO resolved_alerts
      (id, type, location, latitude, longitude, priority, created_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        alert.id,
        alert.type,
        alert.location,
        alert.latitude,
        alert.longitude,
        alert.priority,
        alert.created_at,
      ]
    );

    // Delete from alerts table
    await db.promise().query("DELETE FROM alerts WHERE id = ?", [id]);

    // Save to history table
    await db.promise().query(
      `INSERT INTO history_alerts
      (type, location, latitude, longitude, priority, status, created_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, 'resolved', ?, NOW())`,
      [
        alert.type,
        alert.location,
        alert.latitude,
        alert.longitude,
        alert.priority,
        alert.created_at,
      ]
    );

    // Emit socket event
    const io = req.app.get("io");
    if (io) io.emit("alert-resolved", { alert });

    res.json({ message: " Alert resolved successfully", alert });
  } catch (err) {
    console.error(" DB error (resolveAlert):", err);
    res.status(500).json({ error: "Failed to resolve alert" });
  }
};

// --- Publish alert ---
exports.publishAlert = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query("SELECT * FROM alerts WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Alert not found" });

    const alert = rows[0];

    const [result] = await db.promise().query(
      `INSERT INTO published_alerts (alert_id, type, location, latitude, longitude, priority, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.id,
        alert.type,
        alert.location,
        alert.latitude,
        alert.longitude,
        alert.priority,
        "Alert, Stay safe",
      ]
    );

    res.json({ message: " Alert published", publishedAlertId: result.insertId });
  } catch (err) {
    console.error(" DB error (publishAlert):", err);
    res.status(500).json({ error: "Failed to publish alert" });
  }
};

// --- Get published alerts (last 5 mins) ---
exports.getPublishedAlerts = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM published_alerts 
       WHERE created_at >= NOW() - INTERVAL 5 MINUTE
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(" DB error (getPublishedAlerts):", err);
    res.status(500).json({ error: "Failed to fetch published alerts" });
  }
};

// --- Create a new alert (with blockchain id) ---
exports.createAlert = async (req, res) => {
  const { type, location, latitude, longitude, priority, userId } = req.body;
  if (!type || !priority || !userId) return res.status(400).json({ error: "Missing required fields" });

  try {
    // Get blockchain ID of user
    const [userRows] = await db.promise().query("SELECT blockchain_id FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });

    const blockchainId = userRows[0].blockchain_id;

    // Insert into alerts
    const [result] = await db.promise().query(
      `INSERT INTO alerts
      (type, location, latitude, longitude, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
      [type, location, latitude, longitude, priority]
    );

    const newAlert = {
      id: result.insertId,
      type,
      location,
      latitude,
      longitude,
      priority,
      status: "active",
    };

    const io = req.app.get("io");
    if (io) io.emit("new-alert", newAlert);

    res.json({ message: " Alert created successfully", alert: newAlert });
  } catch (err) {
    console.error(" DB error (createAlert):", err);
    res.status(500).json({ error: "Failed to create alert" });
  }
};

// --- Send SOS Alert ---
exports.sendSOS = async (req, res) => {
  const { userId } = req.params;
  let { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    latitude = 28.2477;
    longitude = 77.0650;
  }

  console.log(`🚨 SOS Alert from user ${userId}: ${latitude}, ${longitude}`);

  try {
    // Get blockchain ID of user
    const [userRows] = await db.promise().query("SELECT blockchain_id FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });

    // Remove blockchain_id from insert query as column does not exist
    const [result] = await db.promise().query(
      `INSERT INTO alerts (type, location, latitude, longitude, priority, status, created_at)
       VALUES ('sos', 'User SOS', ?, ?, 'high', 'active', NOW())`,
      [latitude, longitude]
    );

    const newAlert = {
      id: result.insertId,
      type: "sos",
      location: "User SOS",
      latitude,
      longitude,
      priority: "high",
      status: "active",
      created_at: new Date(),
    };

    const io = req.app.get("io");
    if (io) io.emit("new-alert", newAlert);

    console.log(` SOS Alert saved with ID: ${result.insertId}`);
    res.json({ message: "SOS alert sent", alert: newAlert });
  } catch (err) {
    console.error(" Error in sendSOS:", err);
    res.status(500).json({ error: "Failed to send SOS alert" });
  }
};

// --- Delete alert ---
exports.deleteAlert = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query("DELETE FROM alerts WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Alert not found" });

    res.json({ message: ` Alert ${id} deleted successfully` });
  } catch (err) {
    console.error(" DB error (deleteAlert):", err);
    res.status(500).json({ error: "Failed to delete alert" });
  }
};

// --- Fetch full history ---
exports.getHistory = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM history_alerts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(" DB error (getHistory):", err);
    res.status(500).json({ error: "Failed to fetch alert history" });
  }
};

// --- Download history as text ---
exports.downloadHistory = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM history_alerts ORDER BY created_at DESC");

    let textData = "=== ALERT HISTORY ===\n\n";
    rows.forEach((row) => {
      textData += `ID: ${row.id}, Type: ${row.type}, Location: ${row.location}, Lat: ${row.latitude}, Lng: ${row.longitude}, Priority: ${row.priority}, BlockchainID: ${row.blockchain_id}, Status: ${row.status}, Created: ${row.created_at}, Resolved: ${row.resolved_at || "N/A"}\n`;
    });

    const filePath = path.join(__dirname, "../alert_history.txt");
    fs.writeFileSync(filePath, textData);

    res.download(filePath, "alert_history.txt", (err) => {
      if (err) console.error(" Download error:", err);
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error(" DB error (downloadHistory):", err);
    res.status(500).json({ error: "Failed to download alert history" });
  }
};

// --- Expiry Scheduler ---
exports.startExpiryScheduler = (io) => {
  setInterval(async () => {
    const expiryMinutes = 15;
    try {
      const [rows] = await db
        .promise()
        .query("SELECT * FROM alerts WHERE status = 'active' AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= ?", [expiryMinutes]);

      for (const alert of rows) {
        // Save to history
        await db.promise().query(
          `INSERT INTO history_alerts (type, location, latitude, longitude, priority, status, created_at)
           VALUES (?, ?, ?, ?, ?, 'expired', ?)`,
          [alert.type, alert.location, alert.latitude, alert.longitude, alert.priority, alert.created_at]
        );

        // Save to expired table
        await db.promise().query(
          `INSERT INTO expired_alerts (type, location, latitude, longitude, priority)
           VALUES (?, ?, ?, ?, ?)`,
          [alert.type, alert.location, alert.latitude, alert.longitude, alert.priority]
        );

        // Mark expired
        await db.promise().query("UPDATE alerts SET status = 'expired' WHERE id = ?", [alert.id]);

        if (io) io.emit("alert-expired", { id: alert.id });
        console.log(` Alert ID ${alert.id} expired`);
      }
    } catch (err) {
      console.error(" Expiry check failed:", err);
    }
  }, 60 * 1000);
};
