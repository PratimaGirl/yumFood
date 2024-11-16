const User = require("../db/models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const axios = require("axios");
const jwtSecret = process.env.JWTSECRET;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { transporter } = require("../service/emailService");

// const createUser = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success, errors: errors.array() });
//   }
//   const salt = await bcrypt.genSalt(10);
//   let securePass = await bcrypt.hash(req.body.password, salt);
//   try {
//     await User.create({
//       name: req.body.name,
//       password: securePass,
//       email: req.body.email,
//       location: req.body.location,
//     })
//       .then((user) => {
//         const data = {
//           user: {
//             id: user.id,
//           },
//         };
//         const authToken = jwt.sign(data, jwtSecret);
//         success = true;
//         res.json({ success, authToken });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.json({ error: "Please enter a unique value." });
//       });
//   } catch (error) {
//     console.error(error.message);
//   }
// };

// const login = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email }); //{email:email} === {email}
//     if (!user) {
//       return res
//         .status(400)
//         .json({ success, error: "Try Logging in with correct credentials" });
//     }

//     const pwdCompare = await bcrypt.compare(password, user.password); // this return true false.
//     if (!pwdCompare) {
//       return res
//         .status(400)
//         .json({ success, error: "Try Logging in with correct credentials" });
//     }

//     const data = {
//       user: {
//         id: user.id, // Adding the user ID to the payload
//         email: user.email, // Adding the email to the payload
//       },
//     };

//     success = true;
//     const authToken = jwt.sign(data, jwtSecret);

//     // Respond with authToken, userId, and email
//     res.json({
//       success,
//       authToken,
//       userId: user._id, // Send userId in response
//       email: user.email, // Send email in response
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.send("Server Error");
//   }
// };

const createUser = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  
  // Validate the request body
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const salt = await bcrypt.genSalt(10);
  let securePass = await bcrypt.hash(req.body.password, salt);

  try {
    // Create user with isAdmin field
    await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email,
      location: req.body.location,
      isAdmin: req.body.isAdmin || false,  // Default to false (user) if not provided
    })
      .then((user) => {
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, jwtSecret);
        success = true;
        res.json({ success, authToken });
      })
      .catch((err) => {
        console.log(err);
        res.json({ error: "Please enter a unique value." });
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};


const login = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: "Invalid credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.password);
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Invalid credentials" });
    }

    const data = {
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
    };

    success = true;
    const authToken = jwt.sign(data, jwtSecret);

    res.json({
      success,
      authToken,
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
};


const getUser = async (req, res) => {
  try {
    const query = { ...req.query };

    const users = await User.find(query);

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getLocation = async (req, res) => {
  try {
    let lat = req.body.latlong.lat;
    let long = req.body.latlong.long;

    let location = await axios
      .get(
        "https://api.opencagedata.com/geocode/v1/json?q=" +
          lat +
          "+" +
          long +
          "&key=74c89b3be64946ac96d777d08b878d43"
      )
      .then(async (response) => {
        console.log(response.data.results);

        if (response.data.results.length > 0) {
          let components = response.data.results[0].components;

          // Destructure components with defaults to avoid undefined
          let {
            village = "",
            county = "",
            state_district = "",
            state = "",
            postcode = "",
          } = components;

          return String(
            village +
              (village ? ", " : "") +
              county +
              (county ? ", " : "") +
              state_district +
              (state_district ? ", " : "") +
              state +
              (state ? ", " : "") +
              postcode
          ).trim();
        } else {
          return "Location not found.";
        }
      })
      .catch((error) => {
        console.error(error);
        return "Error fetching location.";
      });

    res.send({ location });
  } catch (error) {
    console.error(error.message);
    res.send("Server Error");
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;  // Access userId from URL
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        location: user.location,
        date: user.date,
        mobile: user.mobile
      },
    });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, email, location, mobile } = req.body;
  const userId = req.params.userId;  // Access userId from URL
  try {
    if (!name || !email || !location) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, location, mobile },
      { new: true }  // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location,
        mobile: updatedUser.mobile,  // Ensure mobile is included in the response
        date: updatedUser.date,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find user by ID and delete
    const user = await User.findByIdAndDelete(userId);

    // If user not found
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// const transporter = nodemailer.createTransport({
//   service: 'gmail', // use your email provider
//   auth: {
//     user: 'singhpratima1703@gmail.com', // email to send from
//     pass: 'iugx tilq puze latq', // app password or regular password
//   },
// });

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }, // Token should not be expired
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Save the new password and clear the reset token and expiration
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  await user.save();

  res.status(200).json({ message: 'Password has been reset successfully' });
};


const forgotPassword =  async (req, res) => {
  const { email } = req.body;
  
  // Check if user exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate a password reset token
  const token = crypto.randomBytes(20).toString('hex');
  
  // Set token expiration time (e.g., 15 minutes)
  const tokenExpirationTime = Date.now() + 15 * 60 * 1000;

  // Save the reset token and expiration time in the user's record
  user.passwordResetToken = token;
  user.passwordResetExpires = tokenExpirationTime;
  await user.save();

  // Send email with the reset link
  const resetLink = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">Reset Password</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email' });
  }
}

module.exports = {
  createUser,
  login,
  getUser,
  getLocation,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  resetPassword,
  forgotPassword
};
