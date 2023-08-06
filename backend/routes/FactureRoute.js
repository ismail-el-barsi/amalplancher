import express from "express";
import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/factureModel.js"; // Update the import
import { isAuth, isAdmin } from "../Utils.js";

const factureRouter = express.Router(); // Rename the router

factureRouter.get("/", async (req, res) => {
  const invoices = await Invoice.find();
  res.send(invoices);
});

factureRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const invoice = new Invoice(req.body); // Use the whole req.body as the invoice data
    const createdInvoice = await invoice.save();
    res
      .status(201)
      .send({ message: "Invoice Created", invoice: createdInvoice });
  })
);

factureRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    if (invoice) {
      invoice.set(req.body); // Update the entire invoice object
      await invoice.save();
      res.send({ message: "Invoice Updated" });
    } else {
      res.status(404).send({ message: "Invoice Not Found" });
    }
  })
);

factureRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice) {
      await invoice.deleteOne();
      res.send({ message: "Invoice Deleted" });
    } else {
      res.status(404).send({ message: "Invoice Not Found" });
    }
  })
);

factureRouter.get("/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const invoice = await Invoice.findById(invoiceId);
  if (invoice) {
    res.send(invoice);
  } else {
    res.status(404).send({ message: "Invoice Not Found" });
  }
});

export default factureRouter; // Export the modified router
