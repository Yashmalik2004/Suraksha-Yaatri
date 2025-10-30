const db = require("../models/db");

// Get contacts for a user
exports.getContacts = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.promise().query("SELECT * FROM user_contacts WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// Add a new contact
exports.addContact = async (req, res) => {
  const userId = req.params.userId;
  const { contact_name, relation, phone_number } = req.body;
  try {
    const [result] = await db.promise().query(
      "INSERT INTO user_contacts (user_id, contact_name, relation, phone_number) VALUES (?, ?, ?, ?)",
      [userId, contact_name, relation, phone_number]
    );
    res.json({ id: result.insertId, contact_name, relation, phone_number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
};

// Update a contact
exports.updateContact = async (req, res) => {
  const contactId = req.params.contactId;
  const { contact_name, relation, phone_number } = req.body;
  try {
    await db.promise().query(
      "UPDATE user_contacts SET contact_name=?, relation=?, phone_number=? WHERE id=?",
      [contact_name, relation, phone_number, contactId]
    );
    res.json({ message: "Contact updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  const contactId = req.params.contactId;
  try {
    await db.promise().query("DELETE FROM user_contacts WHERE id=?", [contactId]);
    res.json({ message: "Contact deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};
