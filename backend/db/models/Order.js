// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      imageUrl: { type: String },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'incomplete'], default: 'incomplete' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
