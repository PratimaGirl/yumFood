// controllers/NotificationController.js
const Notification = require("./../db/models/Notification");

// Create a notification
const createNotification = async (req, res) => {
  const { userId, message, type } = req.body;

  try {
    const notification = new Notification({
      userId,
      message,
      type,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch notifications for a user
// const getUserNotifications = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const notifications = await Notification.find({ userId }).sort({
//       createdAt: -1,
//     });
//     res.status(200).json({ notifications });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const getUserNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;
  
    try {
      // Find the notification by its ID
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
  
      // Set isRead to true
      notification.isRead = true;
      await notification.save();  // Save the updated notification to the database
  
      res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
  
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
  
      res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  const deleteAllNotifications = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await Notification.deleteMany({ userId });
      res.status(200).json({ message: `${result.deletedCount} notifications deleted` });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications
};
