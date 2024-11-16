const mongoose = require('mongoose');
const { Schema } = mongoose;

const foodItemSchema = new Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], required: true },  // Array of ingredients
  restaurantName: { type: String, required: true },
  starRating: { type: Number, required: true, min: 0, max: 5 },  // Star rating between 0-5
  price: { type: Number, required: true },
  imageUrl: { type: String },  // URL for food image
  createdAt: { type: Date, default: Date.now }
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
