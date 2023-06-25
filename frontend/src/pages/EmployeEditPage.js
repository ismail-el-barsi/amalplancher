import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
};

export default function EmployeeEditScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: employeeId } = params;

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [cin, setCin] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/employees/${employeeId}`);
        console.log(data);
        setFullName(data.fullName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setImage(data.image);
        setType(data.type);
        setSalary(data.salary);
        setCin(data.cin);
        dispatch({ type: "FETCH_SUCCESS" });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchEmployee();
  }, [employeeId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `http://localhost:4000/api/employees/${employeeId}`,
        {
          _id: employeeId,
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
      dispatch({
        type: "UPDATE_SUCCESS",
      });
      toast.success("Employee updated successfully");
      navigate("/admin/employees");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(
        "http://localhost:4000/api/upload",
        bodyFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: "UPLOAD_SUCCESS" });
      toast.success("Image uploaded successfully");
      setImage(data.secure_url);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Employee {employeeId}</title>
      </Helmet>
      <h1>Edit Employee {employeeId}</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
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
            <Form.Label>Upload Photo</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="cin">
            <Form.Label>CIN</Form.Label>
            <Form.Control
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="agent commercial">Agent Commercial</option>
              <option value="secretaire/comptable">Secrétaire/Comptable</option>
              <option value="conducteur PL">Conducteur PL</option>
              <option value="conducteur VL">Conducteur VL</option>
              <option value="chef de chantier">Chef de Chantier</option>
              <option value="ouvrier">Ouvrier</option>
              <option value="gardien de nuit">Gardien de Nuit</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="salary">
            <Form.Label>Salary</Form.Label>
            <Form.Control
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </Form>
      )}
    </Container>
  );
}
