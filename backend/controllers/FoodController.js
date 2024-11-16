const FoodItem = require("../db/models/Food");

const addFoodItem = async (req, res) => {
  const { name, ingredients, restaurantName, starRating, price, imageUrl } =
    req.body;

  try {

    const parsedPrice = parseFloat(price).toFixed(2);

    const newFoodItem = new FoodItem({
      name,
      ingredients,
      restaurantName,
      starRating,
      price: parsedPrice,
      imageUrl,
    });

    await newFoodItem.save();
    res
      .status(201)
      .json({ message: "Food item added successfully", foodItem: newFoodItem });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

const updateFoodItem = async (req, res) => {
  const { id } = req.params; // Food item ID
  const { name, ingredients, restaurantName, starRating, price, imageUrl } =
    req.body;

  try {
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      id,
      { name, ingredients, restaurantName, starRating, price, imageUrl },
      { new: true } // Return the updated document
    );

    if (!updatedFoodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json({
      message: "Food item updated successfully",
      foodItem: updatedFoodItem,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

const getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json({ foodItems });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

const getFoodItem = async (req, res) => {
  const { id } = req.params; // Get the food item ID from the URL parameter

  try {
    // Find the food item by its ID
    const foodItem = await FoodItem.findById(id);

    // If no food item is found, return a 404 error
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Return the found food item
    res.json({ foodItem });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

const deleteFoodItem = async (req, res) => {
  const { id } = req.params; // Get the food item ID from the URL parameter

  try {
    // Find and delete the food item by its ID
    const deletedFoodItem = await FoodItem.findByIdAndDelete(id);

    // If no food item is found, return a 404 error
    if (!deletedFoodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Return success message along with the deleted food item
    res.json({
      message: "Food item deleted successfully",
      foodItem: deletedFoodItem,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

module.exports = {
  addFoodItem,
  updateFoodItem,
  getAllFoodItems,
  getFoodItem,
  deleteFoodItem
};
