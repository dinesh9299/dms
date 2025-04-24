const express = require("express");
const router = express.Router();
const authController = require("../controllers/Usercontroller");

router.post("/login", authController.userLogin);
// Public: Admin login
// router.post("/admin/login", authController.adminLogin);

// Public: User login
// router.post("/user/login", authController.userLogin);

// Protected: Only admin can register users
router.post("/register", authController.registerUser);

router.get("/getusers", authController.getUsers);
router.delete("/deleteuser/:id", authController.deleteuser);

module.exports = router;
