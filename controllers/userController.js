const bcrypt = require("bcrypt");
const { userModel } = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const SECRET_CODE = process.env.SECRET_CODE;

const registerController = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    // validation
    if (!userName || !email || !password) {
      return res.status(500).json({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    //check exisiting user
    const exisitingUSer = await userModel.findOne({ email });
    //validation
    if (exisitingUSer) {
      return res.status(500).json({
        success: false,
        message: "email already exists",
      });
    } else {
      bcrypt.hash(password, 5, (err, hash) => {
        if (!err) {
          const user = new userModel({
            userName,
            email,
            password: hash,
          });
          user.save();
          res.status(201).json({
            success: true,
            message: "Registeration Success, please login",
            user,
          });
        } else {
          res.status(400).json({ msg: err });
        }
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error",
      error,
    });
  }
};

//LOGIN
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).json({
        success: false,
        message: "wrong email or password",
      });
    }
    // check user
    const user = await userModel.findOne({ email });
    //user valdiation
    const { fullName, avatar, _id } = user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    bcrypt.compare(password, user.password, async (err, result) => {
      if (result) {
        const token = jwt.sign(
          { userID: user._id, userName: user.userName },
          SECRET_CODE,
          { expiresIn: "1h" }
        );

        const updatedUser = await userModel.findOneAndUpdate(
          { email },
          { $set: { token: token } },
          { new: true }
        );
        if (!updatedUser) {
          return res.status(400).json({ msg: "Failed to update token" });
        }
        res.status(200).send({
          success: true,
          message: "Login Successfully",
          token,
          userName,
          _id,
        });
      } else {
        res.status(400).json({ msg: "wrong password" });
      }
    });
  } catch (error) {
    // console.log(error);
    res.status(500).send({
      success: "false",
      message: "Error In Login Api",
      error,
    });
  }
};

// GET USER PROFILE
const getUserProfileController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User Prfolie Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In PRofile API",
      error,
    });
  }
};

// LOGOUT
const logoutController = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // 1. Find the user by token
      const user = await userModel.findOne({ token });

      if (!user) {
        return res.status(404).json({ msg: "You are not registered" });
      }

      // 2. Unset the token field for the user
      await userModel.updateOne({ _id: user._id }, { $unset: { token: 1 } });

      // 3. Send a success message
      return res.status(200).json({ msg: "You have been logged out!" });
    } else {
      // If token is not provided in headers
      return res.status(400).json({ msg: "Token not provided" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// UPDATE USER PROFILE
const updateProfileController = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json("User not found");
    }
    // validation + Update
    if (userName) {
      user.userName = userName;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    //save user
    await user.save();
    res.status(200).json({
      success: true,
      message: "User Profile Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error In update profile",
      error,
    });
  }
};

// update user passsword
const udpatePasswordController = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    //valdiation
    if (!currentPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }
    // verify current password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    //validation
    if (!isPasswordMatch) {
      return res.status(500).json({
        success: false,
        message: "invalid current password",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 5);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update password",
      error,
    });
  }
};

/// Update user profile photo
//  const updateProfilePicController = async (req, res) => {
//   try {
//     const user = await userModel.findById(req.user._id);
//     // file get from client photo
//     const file = getDataUri(req.file);
//     // delete prev image
//     await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
//     // update
//     const cdb = await cloudinary.v2.uploader.upload(file.content);
//     user.profilePic = {
//       public_id: cdb.public_id,
//       url: cdb.secure_url,
//     };
//     // save func
//     await user.save();

//     res.status(200).send({
//       success: true,
//       message: "profile picture updated",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error In update profile pic API",
//       error,
//     });
//   }
// };

// FORGOT PASSWORD

const passwordResetController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword } = req.body;
    // valdiation
    if (!newPassword) {
      return res.status(500).json({
        success: false,
        message: "Please Provide Password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    //valdiation
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "invalid user or answer",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your Password Has Been Reset Please Login !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In password reset API",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  getUserProfileController,
  logoutController,
  updateProfileController,
  udpatePasswordController,
  passwordResetController,
};
