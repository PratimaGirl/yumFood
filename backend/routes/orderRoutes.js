// routes/orderRoutes.js
const express = require('express');
const { createOrder, getUserOrders, updateOrderStatus, getAllOrders } = require('../controllers/OrderControoler');
const router = express.Router();

// POST route to create a new order
router.post('/', createOrder);

// GET route to retrieve all orders for a user
router.get('/:userId', getUserOrders);

router.get('/', getAllOrders);

// PATCH route to update the status of an order
router.patch('/:orderId', updateOrderStatus);

module.exports = router;
