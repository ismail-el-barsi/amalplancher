import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import Button from "react-bootstrap/Button";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const ITEMS_PER_PAGE = 10;
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        factures: action.payload,
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

export default function FactureListScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [{ loading, error, factures, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get("/api/factures", {
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
      fetchFactures();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (facture) => {
    if (window.confirm("Are you sure you want to delete this facture?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        await axios.delete(`/api/factures/${facture._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("Facture deleted successfully");
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: "DELETE_FAIL" });
      }
    }
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  function Pagination({ currentPage, totalPages, onChange }) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map((pageNumber) => (
            <li
              key={pageNumber}
              className={`page-item ${
                pageNumber === currentPage ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <div className="table-responsive">
      <Helmet>
        <title>Factures</title>
      </Helmet>
      <h1>Factures</h1>
      {loadingDelete && <LoadingBox />}
      <div className="d-flex justify-content-center2 mb-3">
        <input
          type="text"
          placeholder="Rechercher par nom de client..."
          className="form-control w-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Button
            type="button"
            variant="light"
            onClick={() => navigate(`/admin/facture/`)}
          >
            Create
          </Button>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures &&
                factures
                  .filter((facture) =>
                    facture.client
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .slice(startIndex, endIndex)
                  .map((facture) => (
                    <tr key={facture._id}>
                      <td>{facture._id}</td>
                      <td>{facture.client}</td>
                      <td>{facture.date}</td>
                      <td>{facture.montant}</td>
                      <td>
                        <div className="d-grid gap-2">
                          <div className="d-flex gap-2">
                            <Button
                              type="button"
                              variant="light"
                              onClick={() =>
                                navigate(`/admin/viewfactures/${facture._id}`)
                              }
                            >
                              Afficher
                            </Button>
                            <Button
                              type="button"
                              variant="light"
                              onClick={() =>
                                navigate(`/admin/facture/${facture._id}`)
                              }
                            >
                              Modifier
                            </Button>
                            <Button
                              type="button"
                              variant="light"
                              onClick={() => deleteHandler(facture)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              <div className="d-flex justify-content-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(factures.length / ITEMS_PER_PAGE)}
                  onChange={(newPage) => setCurrentPage(newPage)}
                />
              </div>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
