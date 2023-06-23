import React, { useEffect, useReducer, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Product from "../component/Product";
import Loading from "../component/Loading";
import MessageError from "../component/MessageError";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomePage() {
  const location = useLocation();

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const res = await axios.get("http://localhost:4000/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: res.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: error.message });
      }
    };
    fetchData();
  }, [location.search]);

  // return (
  //   <div>
  //     <Helmet>
  //       <title>ShopNow</title>
  //     </Helmet>
  //     <div className="text-center2">
  //       <h1>Featured Products</h1>
  //     </div>

  //     {loading ? (
  //       <Loading />
  //     ) : error ? (
  //       <MessageError variant="danger">{error}</MessageError>
  //     ) : (
  //       <React.Fragment>
  //         <div className="text-center2">
  //           <h1>All Products</h1>
  //         </div>

  //         <div className="products">
  //           <Row>
  //             {products.map((product) => (
  //               <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
  //                 <Product product={product} />
  //               </Col>
  //             ))}
  //           </Row>
  //         </div>
  //       </React.Fragment>
  //     )}
  //   </div>
  // );
}

export default HomePage;
