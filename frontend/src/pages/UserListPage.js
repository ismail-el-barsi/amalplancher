import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import Button from "react-bootstrap/Button";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const reducer = (etat, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...etat, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...etat,
        users: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...etat, loading: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...etat, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return {
        ...etat,
        loadingDelete: false,
        successDelete: true,
      };
    case "DELETE_FAIL":
      return { ...etat, loadingDelete: false };
    case "DELETE_RESET":
      return { ...etat, loadingDelete: false, successDelete: false };

    default:
      return etat;
  }
};
export default function UserListScreen() {
  const navigate = useNavigate();
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`http://localhost:4000/api/users`, {
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

  const deleteHandler = async (user) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        await axios.delete(`http://localhost:4000/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("user deleted successfully");
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: "DELETE_FAIL",
        });
      }
    }
  };
  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1>Users</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "YES" : "NO"}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
