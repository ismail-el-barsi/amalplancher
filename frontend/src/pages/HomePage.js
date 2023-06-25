import React, { useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";
import Loading from "../component/Loading";
import MessageError from "../component/MessageError";
import { Link } from "react-router-dom";

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

const HomePage = () => {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const res = await axios.get("/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: res.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: error.message });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Amal Plancher</title>
      </Helmet>

      <header className="bg-dark text-light text-center py-5">
        <h1>Welcome to Amal Plancher</h1>
        <p>Your reliable source for quality Building materials</p>
        {/* <Button variant="primary" size="lg">
          Shop Now
        </Button> */}
      </header>

      <section className="py-5">
        <Container>
          {loading ? (
            <Loading />
          ) : error ? (
            <MessageError error={error} />
          ) : (
            <Row>
              {products.map((product, index) => (
                <React.Fragment key={product.id}>
                  {index % 2 === 0 ? (
                    <React.Fragment>
                      <Col md={6}>
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="img-fluid"
                          />
                        </Link>
                      </Col>
                      <Col md={6}>
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        {product.countInStock === 0 ? (
                          <Button variant="light" disabled>
                            Out of stock
                          </Button>
                        ) : (
                          <Link to={`/product/${product.slug}`}>
                            <Button variant="secondary">
                              View {product.name}
                            </Button>
                          </Link>
                        )}
                      </Col>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Col md={6}>
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        {product.countInStock === 0 ? (
                          <Button variant="light" disabled>
                            Out of stock
                          </Button>
                        ) : (
                          <Link to={`/product/${product.slug}`}>
                            <Button variant="secondary">
                              View {product.name}
                            </Button>
                          </Link>
                        )}
                      </Col>
                      <Col md={6}>
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="img-fluid"
                          />
                        </Link>
                      </Col>
                    </React.Fragment>
                  )}
                </React.Fragment>
              ))}
            </Row>
          )}
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <h2>Why Choose Us?</h2>
          <Row>
            <Col md={4}>
              <div className="text-center">
                <i className="bi bi-shield-check icon-lg"></i>
                <h5>Quality Products</h5>
                <p>
                  We ensure that our Building materials meet the highest quality
                  standards.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <i className="bi bi-truck icon-lg"></i>
                <h5>Fast Delivery</h5>
                <p>
                  Get your Building materials delivered to your doorstep in no
                  time.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <i className="bi bi-cash icon-lg"></i>
                <h5>Competitive Prices</h5>
                <p>
                  We offer competitive prices without compromising on quality.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
