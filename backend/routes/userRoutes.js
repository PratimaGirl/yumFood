//userRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  login,
  getUser,
  getLocation,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/UserController.js");
const multer = require("multer");
const {
  addToCart,
  getCartItems,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/CartController.js");
const {
  paymentCheckout,
  paymentStatus,
} = require("../controllers/OrderControoler.js");
const authenticateToken = require("../middleware/authenticateToken.js");
const { addFoodItem, updateFoodItem, getAllFoodItems } = require("../controllers/FoodController.js");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// POST route to add new food item
router.post("/", createUser);

// PUT route to update food item
router.post("/login", login);

// GET route to fetch all food items
router.get("/", getUser);

router.post("/location", getLocation);

router.post("/cart/:userId", addToCart);

router.get("/cart/:userId", getCartItems);

router.patch("/cart/:userId/cartItems/:itemId/increment", incrementQuantity);

router.patch("/cart/:userId/cartItems/:itemId/decrement", decrementQuantity);

router.delete("/cart/:userId/cartItems/:itemId", removeFromCart);

router.post("/create-checkout-session", paymentCheckout);

router.get("/checkout-session/:sessionId", paymentStatus);

router.delete("/cart/:userId", clearCart);

router.get("/profile/:userId", getUserProfile);

router.put("/profile/:userId", updateUserProfile);

router.post('/admin/food', authenticateToken, addFoodItem);
router.put('/admin/food/:id', authenticateToken, updateFoodItem);
// router.delete('/admin/food/:id', authenticateToken, deleteFoodItem);
router.get('/admin/food', authenticateToken, getAllFoodItems);

router.delete("/:userId", deleteUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

module.exports = router;
