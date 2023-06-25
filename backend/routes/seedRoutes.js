import express from "express";
import Product from "../models/productModel.js";
import Employee from "../models/employeeModel.js";
import data from "../data.js";
import User from "../models/userModel.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.deleteMany({});
  // await Employee.deleteMany({});

  // await User.deleteMany({});

  const createdProducts = await Product.insertMany(data.products);
  // const createdEmployees = await Employee.insertMany(data.employees);

  // const createdUSers = await User.insertMany(data.users);

  res.send({ createdProducts });
});

export default seedRouter;
