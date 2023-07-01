import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";

function reducer(etat, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...etat, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...etat, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...etat, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...etat, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...etat, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...etat, loadingPay: false };
    case "PAY_RESET":
      return { ...etat, loadingPay: false, successPay: false };
    case "DELIVER_REQUEST":
      return { ...etat, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...etat, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...etat, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...etat,
        loadingDeliver: false,
        successDeliver: false,
      };
    case "SET_PENDING_PAYMENT":
      return { ...etat, pendingPayement: action.payload };
    case "CONFIRM_REQUEST":
      return { ...etat, loadingConfirm: true };
    case "CONFIRM_SUCCESS":
      return { ...etat, loadingConfirm: false, successConfirm: true };
    case "CONFIRM_FAIL":
      return { ...etat, loadingConfirm: false };
    case "CONFIRM_RESET":
      return { ...etat, loadingConfirm: false, successConfirm: false };

    default:
      return etat;
  }
}
export default function OrderScreen() {
  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
  });
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Order is paid");
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        if (userInfo.isConducteur && !data.isPaid) {
          // Navigate to a different route or display an error message
          navigate("/conducteur/orders");
          return;
        }

        if (userInfo.isSecretaire && !data.pendingPayment) {
          // Navigate to a different route or display an error message
          navigate("/secretaire/orders");
          return;
        }
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!userInfo) {
      return navigate("/login");
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get("/api/keys/paypal", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS" });
      dispatch({ type: "SET_PENDING_PAYMENT", payload: false }); // Add this line
      toast.success("Order is delivered");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "DELIVER_FAIL" });
    }
  }
  function confirmOrderHandler() {
    dispatch({ type: "CONFIRM_REQUEST" });

    axios
      .put(
        `/api/orders/${order._id}/confirmer`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      .then(() => {
        dispatch({ type: "CONFIRM_SUCCESS" });
        toast.success("Order is confirmed");

        // Update the order state with the confirmation status
        const updatedOrder = { ...order, confimerCommande: true };
        dispatch({ type: "FETCH_SUCCESS", payload: updatedOrder });
      })
      .catch((err) => {
        toast.error(getError(err));
        dispatch({ type: "CONFIRM_FAIL" });
      });
  }
  function showRouteHandler() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const myLocation = `${position.coords.latitude},${position.coords.longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/dir/${myLocation}/${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`;
        window.open(googleMapsUrl, "_blank");
      },
      (error) => {
        console.error("Error retrieving location:", error);
      }
    );
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                ,{order.shippingAddress.country}
                &nbsp;
                {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <a
                      target="_new"
                      href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                    >
                      Show On Map
                    </a>
                  )}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>
              {!order.isPaid && order.paymentMethod === "PaidOnDelivery" ? (
                <MessageBox variant="alert alert-warning">
                  {order.confimerCommande
                    ? "Waiting for Delivery"
                    : "Waiting for Confirmation"}
                </MessageBox>
              ) : order.isPaid ? (
                <MessageBox variant="success">
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
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
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>{order.itemsPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>{order.shippingPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>{order.taxPrice.toFixed(2)}MAD</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>{order.totalPrice.toFixed(2)}MAD</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {userInfo.isAdmin &&
                  !order.isPaid &&
                  order.paymentMethod !== "PaidOnDelivery" && (
                    <ListGroup.Item>
                      {isPending ? (
                        <LoadingBox />
                      ) : (
                        <div>
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        </div>
                      )}
                      {loadingPay && <LoadingBox></LoadingBox>}
                    </ListGroup.Item>
                  )}

                {userInfo.isAdmin ||
                (userInfo.isConducteur &&
                  order.isPaid &&
                  !order.isDelivered &&
                  (order.paymentMethod === "PaidOnDelivery" ||
                    order.isPaid)) ? (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox />}
                    {(!order.pendingPayement &&
                      order.isPaid &&
                      !order.isDelivered &&
                      !order.confimerCommande) ||
                    order.confimerCommande ? (
                      <div className="d-grid">
                        <Button type="button" onClick={deliverOrderHandler}>
                          Deliver Order
                        </Button>
                      </div>
                    ) : order.confimerCommande ? (
                      <div className="text-center2">Order is confirmed</div>
                    ) : null}
                  </ListGroup.Item>
                ) : null}

                {userInfo.isAdmin ||
                (userInfo.isSecretaire &&
                  order.pendingPayment &&
                  !order.isPaid &&
                  !order.isDelivered) ? (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    {order.isPaid ||
                      (!order.isDelivered &&
                        !order.confimerCommande &&
                        order.paymentMethod === "PaidOnDelivery" && (
                          <div className="d-grid">
                            <Button type="button" onClick={confirmOrderHandler}>
                              Confirmer commande
                            </Button>
                          </div>
                        ))}
                  </ListGroup.Item>
                ) : null}
                {console.log(order.shippingAddress.location.lat)}
                {console.log(order.shippingAddress.location.lng)}
              </ListGroup>
              <Button type="button" onClick={showRouteHandler}>
                Show Route
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
