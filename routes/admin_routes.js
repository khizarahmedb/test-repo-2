const express = require("express");
const router = express.Router();
const {
  adminLogin,
  customerLogin,
  adminSignup,
  customerSignup,
  getAdmin,
  getCustomer,
  getAdminById,
  getCustomerById,
  updateAdmin,
  updateCustomer,
  deleteAdmin,
  deleteCustomer,
} = require("../controllers/admin");
const {
  validateUser,
  validateAdmin,
  validateCustomer,
} = require("../middleware/auth_mv");

//authentication routes

router.post("/admin", adminSignup);
router.post("/customer/signup", customerSignup);
router.post("/admin/login", adminLogin);
router.post("/customer/login", customerLogin);
router.get("/admin", validateUser, validateAdmin, getAdmin);
router.get("/customer/get-all", validateUser, getCustomer);
router.get("/admin/:id", validateUser, validateAdmin, getAdminById);
router.get("/customer/get-by-id/:id", validateUser, getCustomerById);
router.put("/admin/:id", validateUser, validateAdmin, updateAdmin);
router.put("/customer/edit/:id", validateUser, updateCustomer);
router.delete("/admin/:id", validateUser, validateAdmin, deleteAdmin);
router.delete("/customer/delete/:id", validateUser, deleteCustomer);

module.exports = router;
