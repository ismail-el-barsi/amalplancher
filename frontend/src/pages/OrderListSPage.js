import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import { toast } from "react-toastify";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

const OrderListScreen = () => {
  const navigate = useNavigate();
  const { etat } = useContext(Shop);
  const { userInfo } = etat;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const [filter, setFilter] = useState(""); // Filter state
  const [dateFilter, setDateFilter] = useState(""); // Date filter state

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("Order deleted successfully");
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: "DELETE_FAIL",
        });
      }
    }
  };

  // Filter orders based on filter and dateFilter states
  const filteredOrders = orders?.filter((order) => {
    const isPaid = order.isPaid;
    const isConducteur = userInfo.isConducteur;
    const isSecretaire = userInfo.isSecretaire;
    const pendingPayment = order.pendingPayment;

    if (isSecretaire && !pendingPayment) {
      return false; // Hide the order for secretaire if not pending payment
    }

    if (isConducteur && !isPaid && !order.confimerCommande) {
      return false; // Hide the order for conducteur if not paid or not confirmed
    }

    if (filter === "paid") {
      return order.isPaid;
    } else if (filter === "delivered") {
      return order.isDelivered;
    } else if (filter === "date" && dateFilter) {
      // Date filter logic
    } else if (filter === "pending") {
      return order.pendingPayment;
    }
    if (filter === "date" && dateFilter) {
      const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
      const selectedDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      return orderDate === selectedDate;
    }

    return true; // Add a default return statement
  });

  // Function to sort orders by newest
  const sortOrdersByNewest = () => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    return sortedOrders;
  };

  // Function to sort orders by oldest
  const sortOrdersByOldest = () => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });
    return sortedOrders;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setDateFilter(""); // Reset date filter when changing the filter
  };

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1>Orders</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div className="table-responsive">
          <div className="mb-3">
            <label htmlFor="filterSelect" className="me-2">
              Filter by:
            </label>
            <select
              id="filterSelect"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending Payment</option>
              <option value="delivered">Delivered</option>
              <option value="date">Search by Date</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            {filter === "date" && (
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            )}
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>PENDING PAYMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filter === "newest"
                ? sortOrdersByNewest().map((order) => {
                    return (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user ? order.user.name : "DELETED USER"}</td>
                        <td>{order.createdAt.substring(0, 10)}</td>
                        <td>{order.totalPrice.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? order.paidAt.substring(0, 10) : "No"}
                        </td>
                        <td>
                          {order.isDelivered
                            ? order.deliveredAt.substring(0, 10)
                            : "No"}
                        </td>
                        <td>{order.pendingPayment ? "yes" : "no"}</td>
                        <td>
                          <div className="d-grid gap-2">
                            <Button
                              type="button"
                              variant="light"
                              onClick={() => {
                                navigate(`/order/${order._id}`);
                              }}
                            >
                              Details
                            </Button>
                            {userInfo.isAdmin && (
                              <Button
                                type="button"
                                variant="light"
                                onClick={() => deleteHandler(order)}
                                disabled={loadingDelete}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : filter === "oldest"
                ? sortOrdersByOldest().map((order) => {
                    return (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user ? order.user.name : "DELETED USER"}</td>
                        <td>{order.createdAt.substring(0, 10)}</td>
                        <td>{order.totalPrice.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? order.paidAt.substring(0, 10) : "No"}
                        </td>
                        <td>
                          {order.isDelivered
                            ? order.deliveredAt.substring(0, 10)
                            : "No"}
                        </td>
                        <td>{order.pendingPayment ? "yes" : "no"}</td>
                        <td>
                          <div className="d-grid gap-2">
                            <Button
                              type="button"
                              variant="light"
                              onClick={() => {
                                navigate(`/order/${order._id}`);
                              }}
                            >
                              Details
                            </Button>
                            {userInfo.isAdmin && (
                              <Button
                                type="button"
                                variant="light"
                                onClick={() => deleteHandler(order)}
                                disabled={loadingDelete}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : filteredOrders.map((order) => {
                    const isPaid = order.isPaid;
                    const isConducteur = userInfo.isConducteur;
                    const isSecretaire = userInfo.isSecretaire;
                    const pendingPayment = order.pendingPayment;
                    if (isSecretaire && !pendingPayment) {
                      return null;
                    }
                    if (isConducteur && !isPaid && !order.confimerCommande) {
                      return null;
                    }
                    return (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.user ? order.user.name : "DELETED USER"}</td>
                        <td>{order.createdAt.substring(0, 10)}</td>
                        <td>{order.totalPrice.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? order.paidAt.substring(0, 10) : "No"}
                        </td>
                        <td>
                          {order.isDelivered
                            ? order.deliveredAt.substring(0, 10)
                            : "No"}
                        </td>
                        <td>{order.pendingPayment ? "yes" : "no"}</td>
                        <td>
                          <div className="d-grid gap-2">
                            <Button
                              type="button"
                              variant="light"
                              onClick={() => {
                                navigate(`/order/${order._id}`);
                              }}
                            >
                              Details
                            </Button>
                            {userInfo.isAdmin && (
                              <Button
                                type="button"
                                variant="light"
                                onClick={() => deleteHandler(order)}
                                disabled={loadingDelete}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;
