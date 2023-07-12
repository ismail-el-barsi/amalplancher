import React, { useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import Card from "react-bootstrap/Card";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Col, Row } from "react-bootstrap";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/orders/summary", {
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
    fetchData();
  }, [userInfo]);

  const COLORS = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  return (
    <div>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>Dashboard</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="dashboard-card-container">
            <Row>
              <Col xs={6} sm={6} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title className="dashboard-card-title">
                      {summary.users && summary.users.length > 0
                        ? summary.users[0].numUsers
                        : 0}
                    </Card.Title>
                    <Card.Text>Users</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title className="dashboard-card-title">
                      {summary.orders && summary.orders.length > 0
                        ? summary.orders[0].numOrders
                        : 0}
                    </Card.Title>
                    <Card.Text>Orders</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title className="dashboard-card-title">
                      {summary.orders && summary.orders.length > 0
                        ? summary.orders[0].totalSales.toFixed(2)
                        : 0}
                      MAD
                    </Card.Title>
                    <Card.Text>Total Sales</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title className="dashboard-card-title">
                      {summary.employees && summary.employees.length > 0
                        ? summary.employees[0].numEmployees
                        : 0}
                    </Card.Title>
                    <Card.Text>Employees</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title className="dashboard-card-title">
                      {summary.employees && summary.employees.length > 0
                        ? summary.employees[0].totalSalary
                        : 0}
                      MAD
                    </Card.Title>
                    <Card.Text>Total Salary</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          <div className="chart-container">
            <h2 className="chart-heading">Employee Types</h2>
            {summary.employeeTypes.length === 0 ? (
              <MessageBox>No type of employees</MessageBox>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.employeeTypes}
                    dataKey="count"
                    nameKey="_id"
                    fill="#8884d8"
                    label={(entry) => entry._id}
                  >
                    {summary.employeeTypes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-container">
            <h2 className="chart-heading">Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={summary.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    fill="#8884d8"
                    stroke="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-container">
            <h2 className="chart-heading">Categories of product</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.productCategories}
                    dataKey="count"
                    nameKey="_id"
                    fill="#8884d8"
                    label={(entry) => entry._id}
                  >
                    {summary.productCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
