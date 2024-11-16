// routes/notificationRoutes.js
const express = require("express");
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/NotificationsController");

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getUserNotifications);
router.patch("/:notificationId", markNotificationAsRead);
router.delete("/:notificationId", deleteNotification);
router.delete("/all/:userId", deleteAllNotifications);

module.exports = router;
