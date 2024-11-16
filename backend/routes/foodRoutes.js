//foodRoutes.js
const express = require("express");
const router = express.Router();
const {
  addFoodItem,
  updateFoodItem,
  getAllFoodItems,
  addToCart,
  getCart,
  getFoodItem,
  deleteFoodItem,
} = require("../controllers/FoodController.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// POST route to add new food item
router.post("/", upload.single("my_file"), addFoodItem);

// PUT route to update food item
router.put("/edit/:id", updateFoodItem);

// GET route to fetch all food items
router.get("/", getAllFoodItems);

router.get('/:id', getFoodItem);

router.delete("/:id", deleteFoodItem);

module.exports = router;
