import express from "express";
import Product from "../models/productModel.js";
import Employee from "../models/employeeModel.js";
import data from "../data.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.deleteMany({});
  // await Employee.deleteMany({});

  const createdProducts = await Product.insertMany(data.products);
  // const createdEmployees = await Employee.insertMany(data.employees);

  res.send({ createdProducts });
});

export default seedRouter;
