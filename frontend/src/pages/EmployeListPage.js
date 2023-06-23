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

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        employees: action.payload,
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

export default function EmployeeListScreen() {
  const navigate = useNavigate();
  const [
    { loading, error, employees, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          "http://localhost:4000/api/employees",
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
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
      fetchEmployees();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (employee) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        await axios.delete(
          `http://localhost:4000/api/employees/${employee._id}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("Employee deleted successfully");
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: "DELETE_FAIL" });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Employees</title>
      </Helmet>
      <h1>Employees</h1>
      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Button
            type="button"
            variant="light"
            onClick={() => navigate(`/admin/employee/`)}
          >
            Create
          </Button>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <img
                      src={employee.image}
                      alt={employee.fullName}
                      className="employee-image"
                    />
                  </td>
                  <td>{employee._id}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phoneNumber}</td>
                  <td>{employee.type}</td>
                  <td>{employee.salary}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() =>
                        navigate(`/admin/employees/${employee._id}`)
                      }
                    >
                      Edit
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(employee)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
