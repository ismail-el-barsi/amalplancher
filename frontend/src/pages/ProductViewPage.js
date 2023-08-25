import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getError } from "../Utils";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import { format } from "date-fns";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ProductViewScreen() {
  const params = useParams(); // /product/:id
  const { id: productId } = params;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/products/${productId}`);
        setProductName(data.name);
        setHistoricalData(data.historicalData || []);
        dispatch({ type: "FETCH_SUCCESS" });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [productId]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>View Product {productId}</title>
      </Helmet>
      <h1>Historique de stock de produit {productName}</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Quantite</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {historicalData.map((data, index) => (
              <tr key={index}>
                <td>
                  {format(new Date(data.manufacturingDate), "dd/MM/yyyy")}
                </td>
                <td>{data.quantityInBatch}</td>
                <td>{data.typedachat}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
