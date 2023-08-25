import React, { useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shop } from "../Shop";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import Button from "react-bootstrap/esm/Button";
import { toast } from "react-toastify";
import { getError } from "../Utils";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
const reducer = (etat, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...etat, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...etat,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...etat, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      return { ...etat, loadingCreate: true };
    case "CREATE_SUCCESS":
      return {
        ...etat,
        loadingCreate: false,
      };
    case "CREATE_FAIL":
      return { ...etat, loadingCreate: false };
    case "DELETE_REQUEST":
      return { ...etat, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return {
        ...etat,
        loadingDelete: false,
        successDelete: true,
      };
    case "DELETE_FAIL":
      return { ...etat, loadingDelete: false, successDelete: false };

    case "DELETE_RESET":
      return { ...etat, loadingDelete: false, successDelete: false };

    default:
      return etat;
  }
};

export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get("page") || 1;

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {}
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);
  const deleteHandler = async (product) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("product deleted successfully");
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: "DELETE_FAIL",
        });
      }
    }
  };
  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
        <div>
          <Button
            type="button"
            variant="light"
            onClick={() => navigate(`/admin/product/`)}
          >
            <FaEdit className="me-2" />
            Create
          </Button>
        </div>
      </Row>
      {loadingCreate && <LoadingBox />}
      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>PRICE</th>
                  <th>CATEGORY</th>
                  <th>BRAND</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          type="button"
                          variant="light"
                          onClick={() =>
                            navigate(`/admin/viewproduct/${product._id}`)
                          }
                        >
                          <FaEye />
                          Afficher
                        </Button>
                        <Button
                          type="button"
                          variant="light"
                          onClick={() =>
                            navigate(`/admin/product/${product._id}`)
                          }
                        >
                          <FaEdit /> Edit
                        </Button>{" "}
                        <Button
                          type="button"
                          variant="light"
                          onClick={() => deleteHandler(product)}
                        >
                          <FaTrashAlt /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? "btn text-bold" : "btn"}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
