import React, { useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { Shop } from "../Shop";

function Product(accessoires) {
  const { product } = accessoires;
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const {
    panier: { panierItems },
  } = etat;

  const [hovered, setHovered] = useState(false);

  const addTopanierHandler = async (item) => {
    const existItem = panierItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    ctxDispatch({
      type: "PANIER_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };

  return (
    <Card
      className={`product-card ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{ height: "270px", width: "100%" }}
        />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>{product.price} MAD</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addTopanierHandler(product)}>
            Add to cart
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
