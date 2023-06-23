import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/OrderRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import employeRouter from "./routes/EmployeRoute.js";
import path from "path";
//fetch variables in the .env file
dotenv.config();
//connect return a promess
mongoose
  .connect(process.env.MONGODB_URI2)
  .then(() => {
    console.log("connected to databases");
  })
  .catch((err) => {
    console.log(err.message);
  });
const app = express();
//the data in post request converted to json object inside req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});
app.use("/api/upload", uploadRouter);
app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/employees", employeRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"))
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message }); //status(500)=error in server
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
