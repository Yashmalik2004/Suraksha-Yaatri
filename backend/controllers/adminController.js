const db = require("../models/db");


// --- Verify Blockchain ID ---
exports.verifyBlockchainID = (req, res) => {
  const { blockchain_id } = req.body;
  if (!blockchain_id) return res.status(400).json({ error: "Blockchain ID is required" });

  db.query("SELECT * FROM users WHERE blockchain_id = ?", [blockchain_id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.status(404).json({ valid: false, message: "ID not found" });

    res.json({ valid: true, user: result[0] });
  });
};

// --- Set Geo-Fencing Polygon ---
exports.setGeoFence = (req, res) => {
  const { name, coordinates, danger_level, description } = req.body;

  if (!name || !coordinates || !danger_level) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Convert coordinates array to JSON string for DB storage
  const coordsJSON = JSON.stringify(coordinates);

  db.query(
    "INSERT INTO geofences (name, coordinates, danger_level, description) VALUES (?, ?, ?, ?)",
    [name, coordsJSON, danger_level, description || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "Geo-fence created", id: result.insertId });
    }
  );
};

// --- Get All Geo-Fences ---
exports.getGeoFences = (req, res) => {
  db.query("SELECT * FROM geofences", (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(result);
  });
};

// --- Update Geo-Fence ---
exports.updateGeoFence = (req, res) => {
  const { id } = req.params;
  const { name, coordinates, danger_level, description } = req.body;

  const fields = [];
  const values = [];

  if (name) { fields.push("name = ?"); values.push(name); }
  if (coordinates) { fields.push("coordinates = ?"); values.push(JSON.stringify(coordinates)); }
  if (danger_level) { fields.push("danger_level = ?"); values.push(danger_level); }
  if (description) { fields.push("description = ?"); values.push(description); }

  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

  values.push(id);

  db.query(
    `UPDATE geofences SET ${fields.join(", ")} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "Geo-fence updated" });
    }
  );
};
