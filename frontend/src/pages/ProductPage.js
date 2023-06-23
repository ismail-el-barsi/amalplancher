import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import axios from "axios";
import React from "react";
import Rating from "../component/Rating";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import Loading from "../component/Loading";
import MessageError from "../component/MessageError";
import { getError } from "../Utils";
import { Shop } from "../Shop";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";

// etat etat actuel,action qui change etat ectuel et cree une nouvelle etat
const reducer = (etat, action) => {
  switch (action.type) {
    case "REFRESH_PRODUCT":
      return { ...etat, product: action.payload };
    case "CREATE_REQUEST":
      return { ...etat, loadingCreateReview: true };
    case "CREATE_SUCCESS":
      return { ...etat, loadingCreateReview: false };
    case "CREATE_FAIL":
      return { ...etat, loadingCreateReview: false };
    case "FETCH_REQUEST":
      //quand on envoie un ajax requete
      return { ...etat, loading: true }; // ... enregestre les valeurs l etat precedante,qffiche un box de l oading dans l UI
    case "FETCH_SUCCESS":
      return { ...etat, product: action.payload, loading: false }; // ... enregestre les valeurs l etat precedante,products = data coming from action action.payload contient all product from backend
    //loading:false puisque on trouver avec succes les datas du backend et on a pas besoin de l afficher
    case "FETCH_FAIL":
      return { ...etat, loading: false, error: action.payload };
    default:
      return etat;
  }
};

function ProductPage() {
  const [hoveredImage, setHoveredImage] = useState("");

  const handleImageHover = (image) => {
    setHoveredImage(image);
    document.body.style.cursor = "pointer";
  };

  const handleImageLeave = () => {
    setHoveredImage("");
    document.body.style.cursor = "default";
  };

  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const Navigate = useNavigate();
  const params = useParams(); //useparams  You can use it to retrieve route parameters from the component rendered by the matching route
  const { slug } = params;
  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: "",
    }); //use recucer accpte 2 parametre le reducer qui est la fonction qu on creer et l etat par defaut
  //use effect est une fontion qui accepte 2 parametre first parametre fonction et le dexieme est un tableau vide puisque on va utiliser useeffect une seule fois apres rendering du component
  useEffect(() => {
    //finddata async function qui accepte aucun parametre
    const finddata = async () => {
      //send ajax request
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const res = await axios.get(
          `http://localhost:4000/api/products/slug/${slug}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: res.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }

      //setproduct(res.data);
    };
    finddata();
  }, [slug]); //dependance
  // usecontext= give acces to current etat and change context
  const { etat, dispatch: contextDispatch } = useContext(Shop);
  const { panier, userInfo } = etat;
  //function that add item to panier
  const AddToPanierHandler = async () => {
    const existItem = panier.panierItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    //requete ajax for current product
    const { data } = await axios.get(
      `http://localhost:4000/api/products/${product._id}`
    );
    if (data.countInStock < quantity) {
      toast.error("Product is out of stock");
      return;
    }
    //dispatch action on react context
    contextDispatch({
      type: "PANIER_ADD_ITEM",
      payload: { ...product, quantity }, //add quantity by default to 1
    });
    Navigate("/panier");
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error("Please enter comment and rating");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:4000/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: "CREATE_SUCCESS",
      });
      toast.success("Review submitted successfully");
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: "REFRESH_PRODUCT", payload: product });
      window.scrollTo({
        behavior: "smooth",
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: "CREATE_FAIL" });
    }
  };
  return (
    //conditional rendering
    loading ? (
      <Loading />
    ) : error ? (
      <MessageError variant="danger">{error}</MessageError>
    ) : (
      <div>
        <Row>
          <Col md={6}>
            <img
              className="img-large"
              src={hoveredImage ? hoveredImage : product.image}
              alt={product.name}
            />
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Helmet>
                  <title>{product.name}</title>
                </Helmet>
                <h1>{product.name}</h1>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                ></Rating>
              </ListGroup.Item>
              <ListGroup.Item>Price : {product.price} MAD</ListGroup.Item>
              <ListGroup.Item>
                Description:
                <p>{product.description}</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>price</Col>
                      <Col>{product.price}MAD</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>status</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                          <Badge bg="success"> in stock</Badge>
                        ) : (
                          <Badge bg="danger">not in stock </Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <div className="d-grid">
                        <Button onClick={AddToPanierHandler} variant="primary">
                          Add to Cart
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col
            md={6}
            className="d-flex justify-content-center align-items-center"
          >
            {product.image1 ||
            product.image2 ||
            product.image3 ||
            product.image4 ? (
              <div className="carousel">
                <div className="slider-wrapper">
                  {product.image && (
                    <div
                      className="slide"
                      onMouseEnter={() => handleImageHover(product.image)}
                      onMouseLeave={handleImageLeave}
                    >
                      <img
                        className="img-carousel"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                  )}
                  {product.image1 && (
                    <div
                      className="slide"
                      onMouseEnter={() => handleImageHover(product.image1)}
                      onMouseLeave={handleImageLeave}
                    >
                      <img
                        className="img-carousel"
                        src={product.image1}
                        alt="1"
                      />
                    </div>
                  )}
                  {product.image2 && (
                    <div
                      className="slide"
                      onMouseEnter={() => handleImageHover(product.image2)}
                      onMouseLeave={handleImageLeave}
                    >
                      <img
                        className="img-carousel"
                        src={product.image2}
                        alt="2"
                      />
                    </div>
                  )}
                  {product.image3 && (
                    <div
                      className="slide"
                      onMouseEnter={() => handleImageHover(product.image3)}
                      onMouseLeave={handleImageLeave}
                    >
                      <img
                        className="img-carousel"
                        src={product.image3}
                        alt="3"
                      />
                    </div>
                  )}
                  {product.image4 && (
                    <div
                      className="slide"
                      onMouseEnter={() => handleImageHover(product.image4)}
                      onMouseLeave={handleImageLeave}
                    >
                      <img
                        className="img-carousel"
                        src={product.image4}
                        alt="4"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </Col>
        </Row>
        <div className="my-3">
          <h2 ref={reviewsRef}>Reviews</h2>
          <div className="mb-3">
            {product.reviews.length === 0 && (
              <MessageError>There is no review</MessageError>
            )}
          </div>
          <ListGroup>
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating rating={review.rating} caption=" "></Rating>
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="my-3">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <h2>Write a customer review</h2>
                <Form.Group className="mb-3" controlId="rating">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    aria-label="Rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="1">1- Poor</option>
                    <option value="2">2- Fair</option>
                    <option value="3">3- Good</option>
                    <option value="4">4- Very good</option>
                    <option value="5">5- Excelent</option>
                  </Form.Select>
                </Form.Group>
                <FloatingLabel
                  controlId="floatingTextarea"
                  label="Comments"
                  className="mb-3"
                >
                  <Form.Control
                    as="textarea"
                    placeholder="Leave a comment here"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </FloatingLabel>

                <div className="mb-3">
                  <Button disabled={loadingCreateReview} type="submit">
                    Submit
                  </Button>
                  {loadingCreateReview && <Loading></Loading>}
                </div>
              </form>
            ) : (
              <MessageError>
                Please{" "}
                <Link to={`/signin?redirect=/product/${product.slug}`}>
                  Sign In
                </Link>{" "}
                to write a review
              </MessageError>
            )}
          </div>
        </div>
      </div>
    )
  );
}
export default ProductPage;
