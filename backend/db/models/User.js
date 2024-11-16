const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the CartItem schema as a sub-schema
const CartItemSchema = new Schema({
  foodItemId: {
    type: Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  starRating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Define the User schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cartItems: [CartItemSchema],
  isAdmin: { type: Boolean, default: false },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);
