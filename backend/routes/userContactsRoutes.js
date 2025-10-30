const express = require("express");
const router = express.Router();
const userContactsController = require("../controllers/userContactsController");

router.get("/:userId", userContactsController.getContacts);
router.post("/:userId", userContactsController.addContact);
router.put("/:contactId", userContactsController.updateContact);
router.delete("/:contactId", userContactsController.deleteContact);

module.exports = router;
