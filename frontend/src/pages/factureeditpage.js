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
  const [montantEnEspece, setMontantEnEspece] = useState(0);
  const [montantDeCheque, setMontantDeCheque] = useState(0);
  const [numCheque, setNumCheque] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const handleModeReglementChange = (selectedMode) => {
    setModeReglement(selectedMode);
  };
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
        setMontantDeCheque(data.montantDeCheque);
        setMontantEnEspece(data.montantEnEspece);
        setNumCheque(data.numCheque);
        setUnitOfMeasure(data.unitOfMeasure);
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
    const calculatedTotalTtc = quantite * prixUni;
    const calculatedTotalHt = calculatedTotalTtc / 1.2;
    const calculatedTotalTva = calculatedTotalTtc - calculatedTotalHt;
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
          montantEnEspece,
          montantDeCheque,
          numCheque,
          unitOfMeasure,
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
  const paymentOptions = [
    { value: "chèque", label: "Chèque" },
    { value: "espèce", label: "Espèce" },
    { value: "chèque et espèce", label: "Chèque et Espèce" },
  ];

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
