import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    type: { type: String, default: "" },
    material: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
    manufacturingDate: { type: Date },
    quantityInBatch: { type: Number },
    typedachat: {
      type: String,
      enum: ["achat", "vente"], // Only "achat" or "vente" values are allowed
    },
    historicalData: [
      {
        manufacturingDate: { type: Date },
        quantityInBatch: { type: Number },
        typedachat: {
          type: String,
          enum: ["achat", "vente"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
