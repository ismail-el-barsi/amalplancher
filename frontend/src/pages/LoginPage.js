import React, { useEffect, useState } from "react";
import Axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { useContext } from "react"; // Remove this line
import { Shop } from "../Shop";
import { getError } from "../Utils";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect"); //instanciate from urlsearchparams to search and passing search object and get redirect  in querry string
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //save userinfo in Shop and local storage
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { userInfo } = etat;
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post("/api/users/login", {
        email,
        password,
      });

      if (!data.isConfirmed) {
        toast.success("Please confirm your email");
        navigate(`/confirm-email/${data._id}`);
      } else {
        ctxDispatch({ type: "USER_LOGIN", payload: data });
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate(redirect || "/");
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };

  //if user already logged in can t redirect to loginpage
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]); //dependeance on met tous les donnes qu on utilise
  return (
    <Container className="small-container">
      <Helmet>
        <title>login</title>
      </Helmet>
      <h1 className="my-3">Log In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign In</Button>
        </div>
        <div className="mb-3">
          New client?{" "}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
        <div className="mb-3">
          Forget Password? <Link to={`/forget-password`}>Reset Password</Link>
        </div>
      </Form>
    </Container>
  );
}
