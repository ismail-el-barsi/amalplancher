import express from "express";
import expressAsyncHandler from "express-async-handler";
import Employee from "../models/employeeModel.js";
import { isAuth, isAdmin } from "../Utils.js";

const employeeRouter = express.Router();

employeeRouter.get("/", async (req, res) => {
  const employees = await Employee.find();
  res.send(employees);
});
employeeRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const employee = new Employee({
      fullName: req.body.fullName,
      image: req.body.image,
      cin: req.body.cin,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      type: req.body.type,
      salary: req.body.salary,
    });
    const createdEmployee = await employee.save();
    res
      .status(201)
      .send({ message: "Employee Created", employee: createdEmployee });
  })
);

employeeRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);
    if (employee) {
      employee.fullName = req.body.fullName;
      employee.image = req.body.image;
      employee.cin = req.body.cin;
      employee.email = req.body.email;
      employee.phoneNumber = req.body.phoneNumber;
      employee.type = req.body.type;
      employee.salary = req.body.salary;
      await employee.save();
      res.send({ message: "Employee Updated" });
    } else {
      res.status(404).send({ message: "Employee Not Found" });
    }
  })
);

employeeRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      await employee.deleteOne();
      res.send({ message: "Employee Deleted" });
    } else {
      res.status(404).send({ message: "Employee Not Found" });
    }
  })
);
employeeRouter.get("/:id", async (req, res) => {
  const employeeId = req.params.id;
  const employee = await Employee.findById(employeeId);
  if (employee) {
    res.send(employee);
  } else {
    res.status(404).send({ message: "Employee Not Found" });
  }
});

export default employeeRouter;
