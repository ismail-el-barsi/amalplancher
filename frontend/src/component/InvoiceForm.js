import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: "",
    ice: "",
    date: "",
    numero: "",
    totalHt: "",
    modeReglement: "",
    quantite: "",
    montant: "",
    totalTtc: "",
    designation: "",
    totalTva: "",
    prixUni: "",
    totalTtc: "",
  });

  useEffect(() => {
    const quantite = parseFloat(formData.quantite);
    const prixUnitaire = parseFloat(formData.prixUni);
    const totalHt = quantite * prixUnitaire;
    const tvaRate = 0.2; // 20%
    const totalTva = totalHt * tvaRate;
    const totalTtcCalc = totalHt + totalTva;

    setFormData((prevData) => ({
      ...prevData,
      totalHt: totalHt.toFixed(2),
      totalTva: totalTva.toFixed(2),
      totalTtc: totalTtcCalc.toFixed(2),
    }));
  }, [formData.quantite, formData.prixUni]);

  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/view-invoice", { state: { invoiceData: formData } });
  };
  return (
    <Container>
      <h2>Generate Invoice</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="client">
          <Form.Label>Client</Form.Label>
          <Form.Control
            type="text"
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="ice">
          <Form.Label>ICE</Form.Label>
          <Form.Control
            type="text"
            value={formData.ice}
            onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="numero">
          <Form.Label>NUMERO</Form.Label>
          <Form.Control
            type="text"
            value={formData.numero}
            onChange={(e) =>
              setFormData({ ...formData, numero: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="totalHt">
          <Form.Label>Total H.T</Form.Label>
          <Form.Control type="text" value={formData.totalHt} readOnly />
        </Form.Group>
        <Form.Group controlId="modeReglement">
          <Form.Label>MODE DE REGLEMENT</Form.Label>
          <Form.Control
            type="text"
            value={formData.modeReglement}
            onChange={(e) =>
              setFormData({ ...formData, modeReglement: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="quantite">
          <Form.Label>Quantité</Form.Label>
          <Form.Control
            type="text"
            value={formData.quantite}
            onChange={(e) =>
              setFormData({ ...formData, quantite: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="montant"></Form.Group>
        <Form.Group controlId="designation">
          <Form.Label>Designation</Form.Label>
          <Form.Control
            type="text"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="totalTva">
          <Form.Label>Total TVA</Form.Label>
          <Form.Control type="text" value={formData.totalTva} readOnly />
        </Form.Group>
        <Form.Group controlId="prixUni">
          <Form.Label>Prix unitaire</Form.Label>
          <Form.Control
            type="text"
            value={formData.prixUni}
            onChange={(e) =>
              setFormData({ ...formData, prixUni: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="TotalTtc">
          <Form.Label>Total T.T.C</Form.Label>
          <Form.Control type="text" value={formData.totalTtc} readOnly />
        </Form.Group>
        {/* Continue adding the missing input groups */}
        <Button type="submit" variant="primary">
          Generate Invoice
        </Button>
      </Form>
    </Container>
  );
};

export default InvoiceForm;
