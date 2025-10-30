const { body } = require("express-validator");

exports.registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  body("aadhar_no")
    .isLength({ min: 12, max: 12 })
    .isNumeric()
    .withMessage("Aadhaar must be exactly 12 digits"),
];

exports.loginValidation = [
  body("password").notEmpty(),
  body("blockchain_id").optional().notEmpty(),
  body("phone").optional(),
  body("email").optional().isEmail(),
];

exports.alertValidation = [
  body("type").isIn(["weapon", "stampede", "fire"]),
  body("location").notEmpty(),
  body("latitude").isFloat({ min: -90, max: 90 }),
  body("longitude").isFloat({ min: -180, max: 180 }),
  body("priority").optional().isIn(["low", "medium", "high"]),
];
