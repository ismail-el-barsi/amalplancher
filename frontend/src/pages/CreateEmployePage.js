import React, { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

const reducer = (etat, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...etat, loading: true };
    case "CREATE_SUCCESS":
      return { ...etat, loading: false };
    case "CREATE_FAIL":
      return { ...etat, loading: false, error: action.payload };
    default:
      return etat;
  }
};

export default function CreateEmployeePage() {
  const navigate = useNavigate();

  const { etat } = useContext(Shop);
  const { userInfo } = etat;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [cin, setCin] = useState("");
  const [uploading, setUploading] = useState(false);

  const createEmployeeHandler = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to create?")) {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          "/api/employees",
          {
            fullName,
            email,
            phoneNumber,
            image,
            type,
            salary,
            cin,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("Employee created successfully");
        dispatch({ type: "CREATE_SUCCESS" });
        navigate(`/admin/employees`);
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: "CREATE_FAIL",
          payload: getError(err),
        });
      }
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setImage(data.secure_url);
      setUploading(false);
    } catch (err) {
      toast.error(getError(err));
      setUploading(false);
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Create New Employee</title>
      </Helmet>
      <h1>Create New Employee</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={createEmployeeHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {uploading && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Control
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="salary">
            <Form.Label>Salary</Form.Label>
            <Form.Control
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="cin">
            <Form.Label>CIN</Form.Label>
            <Form.Control
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button type="submit">Create</Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
