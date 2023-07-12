import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { isAuth, isAdmin, generateToken, sendGrid, baseUrl } from "../Utils.js";
const userRouter = express.Router();
import jwt from "jsonwebtoken";

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);
userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isConducteur: updatedUser.isConducteur,
        isSecretaire: updatedUser.isSecretaire,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);
userRouter.post(
  "/forget-password",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });
      user.resetToken = token;
      await user.save();

      const sgMail = sendGrid();
      const msg = {
        to: `${user.name} <${user.email}>`,
        from: "amal plancher <luciferelbarsi@gmail.com>",
        subject: "Reset Password",
        html: `
          <p>Please click the following link to reset your password:</p>
          <a href="${baseUrl()}/reset-password/${token}">Reset Password</a>
        `,
      };

      try {
        await sgMail.send(msg);
        console.log("Reset password email sent");
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }

      res.send({ message: "We sent a reset password link to your email." });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

userRouter.post(
  "/reset-password",
  expressAsyncHandler(async (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        const user = await User.findOne({ resetToken: req.body.token });
        if (user) {
          if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
            user.resetToken = null; // Clear the reset token after password reset
            await user.save();
            res.send({
              message: "Password reset successfully",
            });
          }
        } else {
          res.status(404).send({ message: "User not found" });
        }
      }
    });
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      user.isConducteur = Boolean(req.body.isConducteur);
      user.isSecretaire = Boolean(req.body.isSecretaire);
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);
userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === "ismail@gmail.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      await user.deleteOne();
      res.send({ message: "User Deleted" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    //expressAsyncHandler=catch errer in async function iside it
    const user = await User.findOne({ email: req.body.email }); //get user by email and return one document from usercollection based on email
    if (user) {
      //if user exist = we have atleast one email
      if (bcrypt.compareSync(req.body.password, user.password)) {
        //check paswoard first parametre passwoard that user entered second is passwoard crypted and stored in database
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isConducteur: user.isConducteur,
          isSecretaire: user.isSecretaire,
          token: generateToken(user),
        });
        return; //cause i am going to continue running the code after sending data
      }
    }
    res.status(401).send({ message: "invalid email or password" });
  })
);
userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isConducteur: user.isConducteur,
      isSecretaire: user.isSecretaire,
      token: generateToken(user),
    });
    return;
  })
);
userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isConducteur: updatedUser.isConducteur,
        isSecretaire: updatedUser.isSecretaire,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

export default userRouter;
