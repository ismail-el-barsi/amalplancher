import React from "react";
import { useContext } from "react";
import { Shop } from "../Shop";
import { Helmet } from "react-helmet-async";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MessageError from "../component/MessageError";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PanierPage() {
  const { etat, dispatch: contextDispatch } = useContext(Shop);
  const navigate = useNavigate();
  const {
    panier: { panierItems }, //from etat we constuct panier to list panieritems in this screen
  } = etat;

  const checkoutHandler = () => {
    navigate("/login?redirect=/livraison");
  };
  const updatePaniertHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    contextDispatch({
      type: "PANIER_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };
  const removeItemHandler = (item) => {
    contextDispatch({ type: "PANIER_REMOVE_ITEM", payload: item });
  };

  return (
    <div>
      <Helmet>
        <title>panier</title>
      </Helmet>
      <h1>panier</h1>
      <Row>
        <Col md={8}>
          {panierItems.length === 0 ? (
            <MessageError>
              panier is empty. <Link to="/">Go Shopping</Link>
            </MessageError>
          ) : (
            <ListGroup>
              {panierItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{" "}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={() =>
                          updatePaniertHandler(item, item.quantity - 1)
                        }
                        variant="light"
                        disabled={item.quantity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{" "}
                      <span>{item.quantity}</span>{" "}
                      <Button
                        variant="light"
                        onClick={() =>
                          updatePaniertHandler(item, item.quantity + 1)
                        }
                        disabled={item.quantity === item.countInStock}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>{item.price}MAD</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal ({panierItems.reduce((a, c) => a + c.quantity, 0)}{" "}
                    items) :
                    {panierItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                    MAD
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={checkoutHandler}
                      disabled={panierItems.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
