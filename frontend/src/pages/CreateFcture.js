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
  const [montantEnEspece, setMontantEnEspece] = useState(0);
  const [montantDeCheque, setMontantDeCheque] = useState(0);
  const [numCheque, setNumCheque] = useState("");

  useEffect(() => {
    const calculatedTotalTtc = quantite * prixUni;
    const calculatedTotalHt = calculatedTotalTtc / 1.2;
    const calculatedTotalTva = calculatedTotalTtc - calculatedTotalHt;

    setTotalHt(calculatedTotalHt);
    setTotalTva(calculatedTotalTva);
    setTotalTtc(calculatedTotalTtc);
    setMontant(calculatedTotalTtc);
  }, [prixUni, quantite]);
  const handleModeReglementChange = (selectedMode) => {
    setModeReglement(selectedMode);
    // Reset montant en espèce and montant de chèque when the payment mode changes
    setMontantEnEspece(0);
    setMontantDeCheque(0);
  };
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
            montantEnEspece,
            montantDeCheque,
            numCheque,
            unitOfMeasure,
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
  const paymentOptions = [
    { value: "chèque", label: "Chèque" },
    { value: "espèce", label: "Espèce" },
    { value: "chèque et espèce", label: "Chèque et Espèce" },
  ];
  const [unitOfMeasure, setUnitOfMeasure] = useState("");

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
            <Form.Label>Numero</Form.Label>
            <Form.Control
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </Form.Group>
          {modeReglement === "espèce" && (
            <Form.Group className="mb-3" controlId="montantEnEspece">
              <Form.Label>Montant en Espèce</Form.Label>
              <Form.Control
                type="number"
                value={montantEnEspece}
                onChange={(e) => setMontantEnEspece(parseFloat(e.target.value))}
                required
              />
            </Form.Group>
          )}

          {modeReglement === "chèque" && (
            <Form.Group className="mb-3" controlId="montantDeCheque">
              <Form.Label>Montant de Chèque</Form.Label>
              <Form.Control
                type="number"
                value={montantDeCheque}
                onChange={(e) => setMontantDeCheque(parseFloat(e.target.value))}
                required
              />
            </Form.Group>
          )}

          {modeReglement === "chèque et espèce" && (
            <>
              <Form.Group className="mb-3" controlId="montantEnEspece">
                <Form.Label>Montant en Espèce</Form.Label>
                <Form.Control
                  type="number"
                  value={montantEnEspece}
                  onChange={(e) =>
                    setMontantEnEspece(parseFloat(e.target.value))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="montantDeCheque">
                <Form.Label>Montant de Chèque</Form.Label>
                <Form.Control
                  type="number"
                  value={montantDeCheque}
                  onChange={(e) =>
                    setMontantDeCheque(parseFloat(e.target.value))
                  }
                  required
                />
              </Form.Group>
            </>
          )}
          {modeReglement === "chèque" && (
            <Form.Group className="mb-3" controlId="numCheque">
              <Form.Label>Numéro de Chèque</Form.Label>
              <Form.Control
                type="text"
                value={numCheque}
                onChange={(e) => setNumCheque(e.target.value)}
                required
              />
            </Form.Group>
          )}
          {modeReglement === "chèque et espèce" && (
            <Form.Group className="mb-3" controlId="numCheque">
              <Form.Label>Numéro de Chèque</Form.Label>
              <Form.Control
                type="text"
                value={numCheque}
                onChange={(e) => setNumCheque(e.target.value)}
                required
              />
            </Form.Group>
          )}
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
          <Form.Group className="mb-3" controlId="quantite">
            <Form.Label>Quantite</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(parseFloat(e.target.value))}
                required
              />
              <Form.Control
                as="select"
                className="ms-2"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                required
              >
                <option value="">Unité</option>
                <option value="M²">M²</option>
                <option value="U">U</option>
                {/* Add other unit options */}
              </Form.Control>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="totalHt">
            <Form.Label>Total HT</Form.Label>
            <Form.Control
              type="number"
              value={totalHt.toFixed(2)}
              onChange={(e) => setTotalHt(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="totalTva">
            <Form.Label>Total TVA</Form.Label>
            <Form.Control
              type="number"
              value={totalTva.toFixed(2)}
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
          <Form.Group className="mb-3" controlId="montant">
            <Form.Label>Montant</Form.Label>
            <Form.Control
              type="number"
              value={montant.toFixed(2)}
              onChange={(e) => setMontant(parseFloat(e.target.value))}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="modeReglement">
            <Form.Label>Mode de Payement</Form.Label>
            <Form.Select
              value={modeReglement}
              onChange={(e) => handleModeReglementChange(e.target.value)}
              required
            >
              <option value="">Sélectionner un mode de payement</option>
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="mb-3">
            <Button type="submit">Creer facture</Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
