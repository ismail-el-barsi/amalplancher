import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { isAuth, isAdmin } from "../Utils.js";

const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});
productRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: req.body.name,
      slug: req.body.slug,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      description: req.body.description,
      material: req.body.material,
      type: req.body.type,
    });
    const createdProduct = await product.save();
    res
      .status(201)
      .send({ message: "Product Created", product: createdProduct });
  })
);
productRouter.put("/updateQuantity/:id", async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  try {
    // Fetch the product from the database
    const product = await Product.findById(productId);

    if (product) {
      // Update the countInStock
      product.countInStock -= quantity;
      await product.save();

      // Return the updated product
      res.send(product);
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating product quantity" });
  }
});
productRouter.put("/updateQuantity2/:id", async (req, res) => {
  const productId = req.params.id;
  const { quantity, action, manufacturingDate } = req.body;

  try {
    const product = await Product.findById(productId);

    if (product) {
      const newHistoricalData = {
        manufacturingDate: manufacturingDate,
        quantityInBatch: quantity,
        typedachat: action,
      };

      product.historicalData.push(newHistoricalData);

      if (action === "achat") {
        product.countInStock += quantity; // Increment stock for "achat"
      } else if (action === "vente") {
        product.countInStock -= quantity; // Decrement stock for "vente"
      }

      await product.save();

      res.send(product);
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating product quantity" });
  }
});

productRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      product.material = req.body.material;
      product.type = req.body.type;
      await product.save();
      res.send({ message: "Product Updated" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);
productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);
productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.send({ message: "Product Deleted" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);
const PAGE_SIZE = 3;
productRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);
productRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
            // 1-50
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};
    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);
productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct("category");
    res.send(categories);
  })
);

productRouter.get("/slug/:slug", async (req, res) => {
  //:slug=get the slug that the user entered to get data about this product from backend
  const product = await Product.findOne({ slug: req.params.slug }); //slug = value that user entered in url
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});
productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    //if product exist
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

productRouter.delete(
  "/:id/historicalData/:historicalDataId",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const historicalDataId = req.params.historicalDataId;

    try {
      const product = await Product.findById(productId);

      if (product) {
        // Find the historical data entry by its ID
        const historicalDataToDelete = product.historicalData.find(
          (data) => data._id.toString() === historicalDataId
        );

        if (historicalDataToDelete) {
          if (historicalDataToDelete.typedachat === "achat") {
            // If it's an "achat," subtract the quantity from the stock
            product.countInStock -= historicalDataToDelete.quantityInBatch;
          } else if (historicalDataToDelete.typedachat === "vente") {
            // If it's a "vente," add the quantity back to the stock
            product.countInStock += historicalDataToDelete.quantityInBatch;
          }

          // Remove the historical data entry from the array
          product.historicalData = product.historicalData.filter(
            (data) => data._id.toString() !== historicalDataId
          );

          // Save the updated product
          await product.save();

          res.send({ message: "Historical data deleted successfully" });
        } else {
          res.status(404).send({ message: "Historical Data Not Found" });
        }
      } else {
        res.status(404).send({ message: "Product Not Found" });
      }
    } catch (error) {
      res.status(500).send({ message: "Error deleting historical data" });
    }
  })
);

export default productRouter;
