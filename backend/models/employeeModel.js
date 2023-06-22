import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    image: { type: String },
    cin: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    type: { type: String, required: true },
    salary: { type: Number, required: true },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
