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

export default function EditInvoicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [designations, setDesignations] = useState([
    {
      // designation: "",
      // prixUni: 0,
      // quantite: 0,
      // unitOfMeasure: "",
    },
  ]);

  const addNewDesignation = () => {
    const newDesignation = {
      designation: "",
      prixUni: 0,
      quantite: 0,
      unitOfMeasure: "",
      montant: 0, // Initialize montant property
      modeReglement: "", // Initialize modeReglement property
    };
    setDesignations([...designations, newDesignation]);
  };

  const handleDesignationChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].designation = value;
    setDesignations(updatedDesignations);
  };
  const handleUnitOfMeasureChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].unitOfMeasure = value;
    setDesignations(updatedDesignations);
  };
  const handlePrixUnitChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].prixUni = parseFloat(value);

    // Calculate and set totalHt based on prixUni and quantite
    const totalHt = parseFloat(value) * updatedDesignations[index].quantite;
    updatedDesignations[index].totalHt = totalHt;

    setDesignations(updatedDesignations);
  };

  const handleQuantiteChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].quantite = parseFloat(value);

    // Calculate and set totalHt based on prixUni and quantite
    const totalHt = updatedDesignations[index].prixUni * parseFloat(value);
    updatedDesignations[index].totalHt = totalHt;

    setDesignations(updatedDesignations);
  };
  const handleMontantEnEspeceChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].montantEnEspece = parseFloat(value);
    setDesignations(updatedDesignations);
  };

  const handleMontantDeChequeChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].montantDeCheque = parseFloat(value);
    setDesignations(updatedDesignations);
  };
  const handleNumChequeChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].numCheque = value;
    setDesignations(updatedDesignations);
  };
  const [prixUni, setPrixUni] = useState(0);
  const [totalHt, setTotalHt] = useState(0);
  const [totalTva, setTotalTva] = useState(0);
  const [totalTtc, setTotalTtc] = useState(0);
  const [montantEnEspece, setMontantEnEspece] = useState(0);
  const [montantDeCheque, setMontantDeCheque] = useState(0);
  const [numCheque, setNumCheque] = useState("");

  const calculateDesignationTotals = (des) => {
    const calculatedTotalTtc = des.quantite * des.prixUni;
    const calculatedTotalHt = calculatedTotalTtc / 1.2;
    const calculatedTotalTva = calculatedTotalTtc - calculatedTotalHt;

    return {
      ...des,
      totalHt: calculatedTotalHt,
      totalTva: calculatedTotalTva,
      totalTtc: calculatedTotalTtc,
    };
  };

  useEffect(() => {
    const updatedDesignations = designations.map((des) =>
      calculateDesignationTotals(des)
    );

    setDesignations(updatedDesignations);
  }, [designations]);

  const handleModeReglementChange = (selectedMode, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].modeReglement = selectedMode;
    setDesignations(updatedDesignations);

    // Reset other payment-related fields when the payment mode changes
    updatedDesignations[index].montantEnEspece = 0;
    updatedDesignations[index].montantDeCheque = 0;
    updatedDesignations[index].numCheque = "";
    setDesignations(updatedDesignations);
  };

  const updateInvoiceHandler = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to update?")) {
      try {
        dispatch({ type: "CREATE_REQUEST" });

        const formattedDesignations = designations.map((des) => ({
          designation: des.designation,
          prixUni: des.prixUni,
          quantite: des.quantite,
          unitOfMeasure:
            des.unitOfMeasure === "Autre" ? des.customUnit : des.unitOfMeasure,
          totalHt: des.totalHt,
          modeReglement: des.modeReglement,
          montant: des.montant,
          totalTtc: des.totalTtc,
          totalTva: des.totalTva,
          montantEnEspece: des.montantEnEspece,
          montantDeCheque: des.montantDeCheque,
          numCheque: des.numCheque,
        }));

        await axios.put(
          `/api/factures/${id}`, // Use the ID to update the specific invoice
          {
            client,
            ice,
            date,
            numero,
            designations: formattedDesignations, // Pass the formatted designations
          },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("Invoice updated successfully");
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
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const { data } = await axios.get(`/api/factures/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Format the fetched date to match the required format
        const formattedDate = new Date(data.date).toISOString().split("T")[0];

        // Update the state with fetched invoice data
        setClient(data.client);
        setIce(data.ice);
        setDate(formattedDate);
        setNumero(data.numero);
        setDesignations(data.designations); // Set initial designations state
        // ... (update other fields as needed)
      } catch (err) {
        // Handle error
      }
    };

    // Fetch invoice data when the component mounts
    fetchInvoiceData();
  }, [id, userInfo.token]);

  const removeDesignation = (indexToRemove) => {
    if (indexToRemove > 0) {
      const updatedDesignations = designations.filter(
        (_, index) => index !== indexToRemove
      );
      setDesignations(updatedDesignations);
    }
  };
  const handleCustomUnitChange = (value, index) => {
    const updatedDesignations = [...designations];
    updatedDesignations[index].customUnit = value;
    setDesignations(updatedDesignations);
  };

  const paymentOptions = [
    { value: "chèque", label: "Chèque" },
    { value: "espèce", label: "Espèce" },
  ];
  const [unitOfMeasure, setUnitOfMeasure] = useState("");

  return (
    <Container className="small-container">
      <Helmet>
        <title>modifier facture</title>
      </Helmet>
      <h1>modifier facture</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={updateInvoiceHandler}>
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

          {designations.map((des, index) => (
            <div key={index}>
              <Form.Group className="mb-3" controlId={`designation${index}`}>
                <Form.Label>Designation {index + 1}</Form.Label>
                <Form.Control
                  value={des.designation}
                  onChange={(e) =>
                    handleDesignationChange(e.target.value, index)
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="prixUni">
                <Form.Label>Prix Unitaire</Form.Label>
                <Form.Control
                  type="number"
                  value={des.prixUni}
                  onChange={(e) => handlePrixUnitChange(e.target.value, index)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="quantite">
                <Form.Label>Quantite</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="number"
                    value={des.quantite}
                    onChange={(e) =>
                      handleQuantiteChange(e.target.value, index)
                    }
                    required
                  />
                  <Form.Control
                    as="select"
                    className="ms-2"
                    value={des.unitOfMeasure}
                    onChange={(e) =>
                      handleUnitOfMeasureChange(e.target.value, index)
                    }
                    required
                  >
                    <option value="">Unité</option>
                    <option value="M²">M²</option>
                    <option value="U">U</option>
                    <option value="Autre">Autre</option>
                  </Form.Control>
                </div>
              </Form.Group>
              {des.unitOfMeasure === "Autre" && (
                <Form.Control
                  type="text"
                  value={des.customUnit}
                  onChange={(e) =>
                    handleCustomUnitChange(e.target.value, index)
                  }
                  placeholder="Saisir une autre unité"
                  required
                />
              )}

              {des.modeReglement === "espèce" && (
                <Form.Group className="mb-3" controlId="montantEnEspece">
                  <Form.Label>Montant en Espèce</Form.Label>
                  <Form.Control
                    type="number"
                    value={des.montantEnEspece}
                    onChange={(e) =>
                      handleMontantEnEspeceChange(e.target.value, index)
                    }
                  />
                </Form.Group>
              )}

              {des.modeReglement === "chèque" && (
                <Form.Group className="mb-3" controlId="montantDeCheque">
                  <Form.Label>Montant de Chèque</Form.Label>
                  <Form.Control
                    type="number"
                    value={des.montantDeCheque}
                    onChange={(e) =>
                      handleMontantDeChequeChange(e.target.value, index)
                    }
                    required
                  />
                </Form.Group>
              )}

              {des.modeReglement === "chèque" && (
                <Form.Group className="mb-3" controlId="numCheque">
                  <Form.Label>Numéro de Chèque</Form.Label>
                  <Form.Control
                    type="text"
                    value={des.numCheque}
                    onChange={(e) =>
                      handleNumChequeChange(e.target.value, index)
                    }
                    required
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-3" controlId="totalHt">
                <Form.Label>Total HT</Form.Label>
                <Form.Control
                  type="number"
                  value={des.totalHt}
                  onChange={(e) => setTotalHt(parseFloat(e.target.value))}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="totalTva">
                <Form.Label>Total TVA</Form.Label>
                <Form.Control
                  type="number"
                  value={des.totalTva}
                  onChange={(e) => setTotalTva(parseFloat(e.target.value))}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="totalTtc">
                <Form.Label>Total TTC</Form.Label>
                <Form.Control
                  type="number"
                  value={des.totalTtc}
                  onChange={(e) => setTotalTtc(parseFloat(e.target.value))}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="montant">
                <Form.Label>Montant</Form.Label>
                <Form.Control
                  type="number"
                  value={des.totalTtc}
                  onChange={(e) => setMontant(parseFloat(e.target.value))}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="modeReglement">
                <Form.Label>Mode de Paiement</Form.Label>
                <Form.Select
                  value={des.modeReglement}
                  onChange={(e) =>
                    handleModeReglementChange(e.target.value, index)
                  }
                  required
                >
                  <option value="">Sélectionner un mode de paiement</option>
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {index > 0 && ( // Only show the delete button for indices greater than 0
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeDesignation(index)}
                >
                  Supprimer Designation
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addNewDesignation}>
            Ajouer une Nouvelle Designation
          </Button>

          <div className="mb-3">
            <Button type="submit">update</Button>
          </div>
        </Form>
      )}
    </Container>
  );
}
