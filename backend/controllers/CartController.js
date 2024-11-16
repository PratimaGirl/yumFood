const mongoose = require("mongoose");
const User = require("../db/models/User");

const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { foodItemId, name, ingredients, restaurantName, starRating, price, quantity = 1, imageUrl } = req.body;

  // Check for required fields
  if (!foodItemId || !name || !ingredients || !restaurantName || !starRating || !price || !imageUrl) {
    return res.status(400).json({ message: "Missing required cart item fields" });
  }

  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemPrice = parseFloat(price);
    const itemQuantity = parseInt(quantity, 10);
    const calculatedTotalPrice = itemPrice * itemQuantity;

    if (isNaN(itemPrice) || isNaN(itemQuantity)) {
      return res.status(400).json({ message: "Invalid price or quantity" });
    }

    // Check if item already exists in the user's cart
    const existingItemIndex = user.cartItems.findIndex(item => item.foodItemId.toString() === foodItemId);

    if (existingItemIndex > -1) {
      // Item exists, so update quantity and total price
      user.cartItems[existingItemIndex].quantity += itemQuantity;
      user.cartItems[existingItemIndex].totalPrice = user.cartItems[existingItemIndex].quantity * itemPrice;
    } else {
      // Item does not exist, so add new item
      const newCartItem = {
        foodItemId:new mongoose.Types.ObjectId(foodItemId),
        name,
        ingredients,
        restaurantName,
        starRating,
        price: itemPrice,
        quantity: itemQuantity,
        imageUrl,
        totalPrice: calculatedTotalPrice,
      };
      user.cartItems.push(newCartItem);
    }

    // Save user with updated cart items
    await user.save();

    res.status(200).json({ message: "Item added to cart", cartItems: user.cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getCartItems = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID and return only their cart items
    const user = await User.findById(userId, "cartItems");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ cartItems: user.cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const removeFromCart = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update to use `cartItems` instead of `cart`
    const cartItemIndex = user.cartItems.findIndex(item => item.foodItemId.toString() === itemId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in the cart' });
    }

    // Remove the item
    user.cartItems.splice(cartItemIndex, 1);
    await user.save();

    res.json({ message: 'Item removed from the cart', cartItems: user.cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from the cart', error: error.message });
  }
};




const incrementQuantity = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    const cartItem = user.cartItems.find(item => item.foodItemId.toString() === itemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in the cart' });
    }

    cartItem.quantity += 1;
    cartItem.totalPrice = cartItem.price * cartItem.quantity;
    await user.save();

    res.json({ message: 'Item quantity incremented', cartItems: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to increment item quantity', error: error.message });
  }
};


const decrementQuantity = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    const cartItem = user.cartItems.find(item => item.foodItemId.toString() === itemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in the cart' });
    }

    // Decrement the quantity, remove if quantity is 1
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      user.cart = user.cart.filter(item => item.foodItemId.toString() !== itemId);
    }
    
    cartItem.totalPrice = cartItem.price * cartItem.quantity;
    await user.save();

    res.json({ message: cartItem.quantity > 1 ? 'Item quantity decremented' : 'Item removed from cart', cartItems: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to decrement item quantity', error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update the user's cartItems field to an empty array
    await User.findByIdAndUpdate(userId, { cartItems: [] });
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error("Failed to clear cart:", error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart
};
