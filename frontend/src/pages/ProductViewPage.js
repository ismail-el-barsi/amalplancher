import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getError } from "../Utils";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination"; // Import Pagination component
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
  const [currentStockCount, setCurrentStockCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/products/${productId}`);
        setProductName(data.name);
        setHistoricalData(data.historicalData || []);
        setCurrentStockCount(data.countInStock || 0);
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

  // Calculate the indexes for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historicalData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleDeleteHistoricalData = async (historicalDataId) => {
    if (
      window.confirm("Are you sure you want to delete this historical data?")
    ) {
      try {
        // Send a DELETE request to the backend API
        await axios.delete(
          `/api/products/${productId}/historicalData/${historicalDataId}`
        );

        // Calculate the updated currentStockCount
        const updatedStockCount = historicalData.reduce((count, data) => {
          if (data._id === historicalDataId) {
            // Adjust count based on the type of data (achat or vente)
            if (data.typedachat === "achat") {
              return count - data.quantityInBatch;
            } else if (data.typedachat === "vente") {
              return count + data.quantityInBatch;
            }
          }
          return count;
        }, currentStockCount);

        // Update the local historicalData state after successful deletion
        setHistoricalData((prevData) =>
          prevData.filter((data) => data._id !== historicalDataId)
        );

        // Update the currentStockCount state
        setCurrentStockCount(updatedStockCount);
      } catch (err) {
        console.error("Error deleting historical data:", err);
      }
    }
  };

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
        <>
          <p>Quantité en stock actuelle : {currentStockCount}</p>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Quantité</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((data, index) => (
                <tr key={index}>
                  <td>
                    {format(new Date(data.manufacturingDate), "dd/MM/yyyy")}
                  </td>
                  <td>{data.quantityInBatch}</td>
                  <td>{data.typedachat}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteHistoricalData(data._id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            {Array.from({
              length: Math.ceil(historicalData.length / itemsPerPage),
            }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </Container>
  );
}
