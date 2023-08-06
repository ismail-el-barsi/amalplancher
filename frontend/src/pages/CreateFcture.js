import React, { useContext, useEffect, useReducer, useState } from "react";
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

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function CreateInvoicePage() {
  const navigate = useNavigate();

  const { etat } = useContext(Shop);
  const { userInfo } = etat;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
    error: "",
  });

  const [client, setClient] = useState("");
  const [ice, setIce] = useState("");
  const [date, setDate] = useState("");
  const [numero, setNumero] = useState("");
  const [modeReglement, setModeReglement] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [montant, setMontant] = useState(0);
  const [designation, setDesignation] = useState("");
  const [prixUni, setPrixUni] = useState(0);
  const [totalHt, setTotalHt] = useState(0);
  const [totalTva, setTotalTva] = useState(0);
  const [totalTtc, setTotalTtc] = useState(0);

  useEffect(() => {
    const calculatedTotalHt = prixUni * quantite;
    const calculatedTotalTva = calculatedTotalHt * 0.2; // Assuming 20% VAT
    const calculatedTotalTtc = calculatedTotalHt + calculatedTotalTva;
    setTotalHt(calculatedTotalHt);
    setTotalTva(calculatedTotalTva);
    setTotalTtc(calculatedTotalTtc);
    setMontant(calculatedTotalTtc);
  }, [prixUni, quantite]);

  const createInvoiceHandler = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to create?")) {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          "/api/factures",
          {
            client,
            ice,
            date,
            numero,
            totalHt,
            totalTva,
            totalTtc,
            modeReglement,
            quantite,
            montant,
            designation,
            prixUni,
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("Invoice created successfully");
        dispatch({ type: "CREATE_SUCCESS" });
        navigate(`/admin/factures/`);
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: "CREATE_FAIL",
          payload: getError(err),
        });
      }
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Creer facture</title>
      </Helmet>
      <h1>Creer facture</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={createInvoiceHandler}>
          <Form.Group className="mb-3" controlId="client">
            <Form.Label>Client</Form.Label>
            <Form.Control
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="ice">
            <Form.Label>ICE</Form.Label>
            <Form.Control
              value={ice}
              onChange={(e) => setIce(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="numero">
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="modeReglement">
            <Form.Label>Mode of Payment</Form.Label>
            <Form.Control
              value={modeReglement}
              onChange={(e) => setModeReglement(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="quantite">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={quantite}
              onChange={(e) => setQuantite(parseFloat(e.target.value))}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="montant">
            <Form.Label>Montant</Form.Label>
            <Form.Control
              type="number"
              value={montant}
              onChange={(e) => setMontant(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="designation">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="prixUni">
            <Form.Label>Prix Unitaire</Form.Label>
            <Form.Control
              type="number"
              value={prixUni}
              onChange={(e) => setPrixUni(parseFloat(e.target.value))}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="totalHt">
            <Form.Label>Total HT</Form.Label>
            <Form.Control
              type="number"
              value={totalHt}
              onChange={(e) => setTotalHt(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="totalTva">
            <Form.Label>Total TVA</Form.Label>
            <Form.Control
              type="number"
              value={totalTva}
              onChange={(e) => setTotalTva(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="totalTtc">
            <Form.Label>Total TTC</Form.Label>
            <Form.Control
              type="number"
              value={totalTtc}
              onChange={(e) => setTotalTtc(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>

          <div className="mb-3">
            <Button type="submit">Creer facture</Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
