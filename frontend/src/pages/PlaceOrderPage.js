import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import CheckoutSteps from "../component/CheckoutSteps";
import { Shop } from "../Shop";
import { toast } from "react-toastify";
import { getError } from "../Utils";
import LoadingBox from "../component/Loading";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderPage() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { panier, userInfo } = etat;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.1111 => 123.11
  panier.itemsPrice = round2(
    panier.panierItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  panier.livraisonPrice = panier.itemsPrice > 100 ? round2(0) : round2(10);
  panier.taxPrice = round2(0.15 * panier.itemsPrice);
  panier.totalPrice =
    panier.itemsPrice + panier.livraisonPrice + panier.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" });

      const { data } = await Axios.post(
        "/api/orders",
        {
          orderItems: panier.panierItems,
          shippingAddress: panier.livraisonAddress,
          paymentMethod: panier.paymentMethod,
          itemsPrice: panier.itemsPrice,
          shippingPrice: panier.livraisonPrice,
          taxPrice: panier.taxPrice,
          totalPrice: panier.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: "panier_CLEAR" });
      dispatch({ type: "CREATE_SUCCESS" });
      localStorage.removeItem("panierItems");
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!panier.paymentMethod) {
      navigate("/payment");
    }
  }, [panier, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {panier.livraisonAddress.fullName} <br />
                <strong>Address: </strong> {panier.livraisonAddress.address},
                {panier.livraisonAddress.city},{" "}
                {panier.livraisonAddress.postalCode},
                {panier.livraisonAddress.country}
              </Card.Text>
              <Link to="/livraison">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {panier.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {panier.panierItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{" "}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price}MAD</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/panier">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>{panier.itemsPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>{panier.livraisonPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>{panier.taxPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>{panier.totalPrice.toFixed(2)}MAD</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={panier.panierItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
