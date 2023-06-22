import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    //If you set timestamps: true, Mongoose will add two properties of type Date to your schema:
    //createdAt: a date representing when this document was created
    //updatedAt: a date representing when this document was last updated
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export default User;
