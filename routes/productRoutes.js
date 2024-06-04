// Import packages
const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllProductsStatic,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require("../controllers/productController");

// Import middleware
const { authenticateToken, authorizeRoles } = require("../middleware/authenticateToken");

// Set up routes

router.route("/").get(getAllProducts).post(authenticateToken, authorizeRoles("admin"), createProduct);
router.route("/upload-image").post(authenticateToken, authorizeRoles("admin"), uploadProductImage);
router.route("/static").get(getAllProductsStatic);
router
  .route("/:id")
  .get(getProduct)
  .patch(authenticateToken, authorizeRoles("admin"), updateProduct)
  .delete(authenticateToken, authorizeRoles("admin"), deleteProduct);

// Export router
module.exports = router;
