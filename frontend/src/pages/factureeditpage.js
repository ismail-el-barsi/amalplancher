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
    default:
      return state;
  }
};

export default function EditInvoicePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: invoiceId } = params;

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const [client, setClient] = useState("");
  const [ice, setIce] = useState("");
  const [date, setDate] = useState("");
  const [numero, setNumero] = useState("");
  const [modeReglement, setModeReglement] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [designation, setDesignation] = useState("");
  const [prixUni, setPrixUni] = useState(0);
  const [totalHt, setTotalHt] = useState(0);
  const [totalTva, setTotalTva] = useState(0);
  const [totalTtc, setTotalTtc] = useState(0);
  const [montant, setMontant] = useState(0);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/factures/${invoiceId}`);
        setClient(data.client);
        setIce(data.ice);

        const formattedDate = new Date(data.date)
          .toISOString()
          .substring(0, 10);
        setDate(formattedDate);

        setNumero(data.numero);
        setModeReglement(data.modeReglement);
        setQuantite(data.quantite);
        setDesignation(data.designation);
        setPrixUni(data.prixUni);
        setTotalHt(data.totalHt);
        setTotalTva(data.totalTva);
        setTotalTtc(data.totalTtc);
        setMontant(data.montant);

        dispatch({ type: "FETCH_SUCCESS" });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleQuantityChange = (e) => {
    setQuantite(parseFloat(e.target.value));
  };

  const handlePrixUniChange = (e) => {
    setPrixUni(parseFloat(e.target.value));
  };

  useEffect(() => {
    const calculatedTotalHt = quantite * prixUni;
    const calculatedTotalTva = calculatedTotalHt * 0.2; // Assuming 20% VAT
    const calculatedTotalTtc = calculatedTotalHt + calculatedTotalTva;
    setTotalHt(calculatedTotalHt);
    setTotalTva(calculatedTotalTva);
    setTotalTtc(calculatedTotalTtc);
    setMontant(calculatedTotalTtc);
  }, [quantite, prixUni]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `/api/factures/${invoiceId}`,
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
      dispatch({
        type: "UPDATE_SUCCESS",
      });
      toast.success("Invoice updated successfully");
      navigate("/admin/factures");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Invoice {invoiceId}</title>
      </Helmet>
      <h1>Edit Invoice {invoiceId}</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
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
              onChange={handleQuantityChange}
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
              onChange={handlePrixUniChange}
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
