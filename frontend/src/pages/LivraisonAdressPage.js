import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { Shop } from "../Shop";
import CheckoutSteps from "../component/CheckoutSteps";

export default function LivraisonAdressPage() {
  const navigate = useNavigate();
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  //get shiping adress from painier in etat
  const {
    fullBox,
    userInfo,
    panier: { livraisonAddress },
  } = etat;
  const [fullName, setFullName] = useState(livraisonAddress.fullName || ""); //if fullname exist then use it as default otherwise empty string
  const [address, setAddress] = useState(livraisonAddress.address || "");
  const [city, setCity] = useState(livraisonAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    livraisonAddress.postalCode || ""
  );
  useEffect(() => {
    if (!userInfo) {
      navigate("/login?redirect=/livraison");
    }
  }, [userInfo, navigate]);
  const [country, setCountry] = useState(livraisonAddress.country || "");
  const submitHandler = (e) => {
    //prevent page from refresshing on submit
    e.preventDefault();
    ctxDispatch({
      type: "SAVE_LIVRAISON_ADDRESS",
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: livraisonAddress.location,
      },
    });
    //on refreh don t loose data that user entered
    localStorage.setItem(
      "livraisonAddress",
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: livraisonAddress.location,
      })
    );
    navigate("/payment");
  };
  useEffect(() => {
    ctxDispatch({ type: "SET_FULLBOX_OFF" });
  }, [ctxDispatch, fullBox]);
  return (
    <div>
      <Helmet>
        <title>Livraison Address</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3">Livraison Address</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button
              id="chooseOnMap"
              type="button"
              variant="light"
              onClick={() => navigate("/map")}
            >
              Choose Location On Map
            </Button>
            {livraisonAddress.location && livraisonAddress.location.lat ? (
              <div>
                LAT: {livraisonAddress.location.lat}
                LNG:{livraisonAddress.location.lng}
              </div>
            ) : (
              <div>No location</div>
            )}
          </div>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
