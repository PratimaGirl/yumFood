const Notification = require("../db/models/Notification");
const Order = require("../db/models/Order");
const User = require("../db/models/User");
const { transporter } = require("../service/emailService");

const createOrder = async (req, res) => {
  const { userId, items, totalAmount, status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedTotalAmount = parseFloat(totalAmount).toFixed(2);

    const newOrder = new Order({
      userId,
      items,
      totalAmount: formattedTotalAmount,
      status: status || "incomplete",
    });

    await newOrder.save();

    const message = `Your order of ₹${totalAmount} has been placed successfully!`;
    const notification = new Notification({
      userId,
      message,
      type: "success",
    });

    await notification.save();
    await sendOrderEmail(user.email, newOrder);

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentCheckout = async (req, res) => {
  const { cartItems, customerName, customerAddress } = req.body;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: item.name,
        description: `Restaurant: ${item.restaurantName}`,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
      payment_intent_data: {
        metadata: {
          customer_name: customerName,
          customer_address: JSON.stringify(customerAddress),
        },
      },
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );
    res.json({
      status: session.payment_status,
    });
  } catch (error) {
    console.error("Error retrieving session: ", error);
    res.status(500).send("Error retrieving payment session");
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .exec();

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const sendOrderEmail = (userEmail, orderDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Order Confirmation",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #4CAF50;
              font-size: 24px;
              text-align: center;
              margin-bottom: 20px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .order-summary {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .order-summary p {
              font-size: 14px;
              color: #555;
            }
            .order-details {
              margin: 10px 0;
              padding-left: 20px;
            }
            .order-details li {
              list-style-type: none;
              padding: 5px 0;
            }
            .total-amount {
              font-weight: bold;
              color: #333;
              font-size: 18px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Order Confirmation</h1>
            <p>Dear Customer,</p>
            <p>Thank you for your order! We're excited to confirm that we've received your order and will process it shortly.</p>
            
            <div class="order-summary">
              <p><strong>Order ID:</strong> ${orderDetails._id}</p>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
            </div>

            <div class="order-details">
              <h3>Items Ordered:</h3>
              <ul>
                ${orderDetails.items
                  .map(
                    (item) => `
                  <li><strong>${item.name}</strong> (x${item.quantity}) - ₹${(
                      item.price * item.quantity
                    ).toFixed(2)}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <p class="total-amount">Total Amount: ₹${
              orderDetails.totalAmount
            }</p>

            <p>If you have any questions, feel free to <a href="mailto:support@example.com">contact us</a>.</p>
            
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>Best regards,<br>Your Food Delivery Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  paymentCheckout,
  paymentStatus,
  getAllOrders,
  sendOrderEmail,
};
