const express = require('express');
const router = express.Router();
const db = require('../models/db'); // your MySQL connection

// Get all contacts for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  db.query(
    'SELECT * FROM user_contacts WHERE user_id = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Add a new contact
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const { contact_name, relation, phone_number } = req.body;
  db.query(
    'INSERT INTO user_contacts (user_id, contact_name, relation, phone_number) VALUES (?, ?, ?, ?)',
    [userId, contact_name, relation, phone_number],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, contact_name, relation, phone_number });
    }
  );
});

// Edit a contact
router.put('/:contactId', (req, res) => {
  const { contactId } = req.params;
  const { contact_name, relation, phone_number } = req.body;
  db.query(
    'UPDATE user_contacts SET contact_name = ?, relation = ?, phone_number = ? WHERE id = ?',
    [contact_name, relation, phone_number, contactId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contact updated successfully' });
    }
  );
});

// Delete a contact
router.delete('/:contactId', (req, res) => {
  const { contactId } = req.params;
  db.query('DELETE FROM user_contacts WHERE id = ?', [contactId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contact deleted successfully' });
  });
});

module.exports = router;
