const express = require("express");
const router = express.Router();
const authController = require("../controllers/Usercontroller");

router.post("/login", authController.login);
// Public: Admin login
// router.post("/admin/login", authController.adminLogin);

// Public: User login
// router.post("/user/login", authController.userLogin);

// Protected: Only admin can register users
router.post("/admin/register-user", authController.registerUser);

module.exports = router;
