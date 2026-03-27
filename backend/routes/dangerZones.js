
const express = require("express");
const router = express.Router();
const db = require("../models/db");

router.get("/", async (req, res) => {
  const [rows] = await db.promise().query("SELECT * FROM danger_zones");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, type, severity, shape, coordinates, radius, status } = req.body;
  const [result] = await db.promise().query(
    "INSERT INTO danger_zones (name, type, severity, shape, coordinates, radius, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, type, severity, shape, coordinates, radius, status]
  );
  res.json({ id: result.insertId });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.promise().query("DELETE FROM danger_zones WHERE id = ?", [id]);
  res.json({ success: true });
});

module.exports = router;
