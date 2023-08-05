import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo/logo2.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ViewInvoice = () => {
  const location = useLocation();
  const { invoiceData } = location.state;
  const invoiceRef = useRef(null);

  const generatePDF = async () => {
    const input = invoiceRef.current;
    const scale = 5; // Adjust the scale factor for higher resolution

    const generateButton = input.querySelector(".generate-button");
    generateButton.style.display = "none";

    // Generate a canvas from the HTML
    const canvas = await html2canvas(input, { scale: scale, useCORS: true });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4"); // Create an A4 size PDF

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");

    generateButton.style.display = "block";
  };

  return (
    <Container
      ref={invoiceRef}
      className="p-3"
      style={{
        maxWidth: "210mm", // A4 page width
        border: "1px solid black",
      }}
    >
      <Card border="dark" style={{ height: "150px" }}>
        <div className="invoice-header text-center2 mb-4 d-flex align-items-center">
          <div className="logo">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "110px", height: "100px" }}
            />
          </div>
          <div
            className="separator"
            style={{
              borderLeft: "2px solid darkgray",
              height: "180px",
              marginRight: "20px",
            }}
          ></div>
          <div className="company-info">
            <h1 className="mb-0 fs-2">SOCIETE AMAL PLANCHER S.A.R.L</h1>
            <p className="mb-2">Au capital de 120000,OO DH</p>
            <p>AGGLOMERIE-POUTRELLE-VENTE DE MATERIAUX DE CONSTRUCTION</p>
          </div>
        </div>
      </Card>
      <Card border="dark" style={{ height: "140px" }}>
        <h2 className="text-primary text-center2 text-decoration-underline fs-1">
          FACTURE
        </h2>
        <Card.Body>
          <p>
            <strong>Client:</strong> {invoiceData.client}
          </p>
          <p>
            <strong>ICE:</strong> {invoiceData.ice}
          </p>
        </Card.Body>
      </Card>

      <Card className="mt-4" border="dark">
        <Card.Body>
          <div className="info-row">
            <div className="info-cell">
              <p>
                <strong>NUMERO:</strong>
              </p>
              <p>{invoiceData.numero}</p>
            </div>
            <div className="info-cell">
              <p>
                <strong>Date:</strong>
              </p>
              <p>{invoiceData.date}</p>
            </div>
            <div className="info-cell">
              <p>
                <strong>MODE DE REGLEMENT:</strong>
              </p>
              <p>{invoiceData.modeReglement}</p>
            </div>
            <div className="info-cell">
              <p>
                <strong>MONTANT:</strong>
              </p>
              <p>{invoiceData.totalTtc}</p>
            </div>
          </div>
        </Card.Body>
        <Card.Body>
          <Card className="mt-4" border="dark">
            <Card.Body>
              <div className="info-row">
                <div className="info-cell" style={{ flex: "2.5" }}>
                  <p>
                    <strong>Designation:</strong>
                  </p>
                  <p>{invoiceData.designation}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>Quantité:</strong>
                  </p>
                  <p>{invoiceData.quantite}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>Prix unitaire:</strong>
                  </p>
                  <p>{invoiceData.prixUni}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>Total T.T.C:</strong>
                  </p>
                  <p>{invoiceData.totalTtc}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
        <Card className="mt-4" border="dark">
          <Card.Body>
            <div className="info-row">
              <div className="info-cell">
                <p>
                  <strong>Total H.T:</strong>
                </p>
                <p>{invoiceData.totalHt}</p>
              </div>
              <div className="info-cell">
                <p>
                  <strong>Total TVA:</strong>
                </p>
                <p>{invoiceData.totalTva}</p>
              </div>
              <div className="info-cell">
                <p>
                  <strong>Total T.T.C:</strong>
                </p>
                <p>{invoiceData.totalTtc}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Card>
      <div class="container text-center2 mt-5">
        <span class="underline">
          <strong>Arrêtée la présente facture à la somme de (T.T.C):</strong>
        </span>
        <p>{invoiceData.totalTtc}</p>
      </div>
      {/* Footer */}
      <Card className="mt-4" border="dark">
        <Card.Body className="text-center2">
          <p>
            <strong>R.C :</strong> 24915- <strong>IF :</strong> 30715018-{" "}
            <strong>Patente :</strong> 22270237- <strong>CNSS :</strong>{" "}
            7445457- <strong>Tel :</strong> 0661928486
          </p>
          <p>
            <strong>l.C.E:</strong> 000090460000040
          </p>
          <p>
            <strong>Banque Populaire Souk el arbaâ du Gharb :</strong> Compte NO
            :21211 9359664 001 4
          </p>
          <p>
            <strong>Siège social:</strong> Km 143, Route Rabat Tanger, Province
            de Kenitra ARBAOUA
          </p>
        </Card.Body>
      </Card>

      {/* Generate PDF button */}
      <button
        onClick={generatePDF}
        className="btn btn-primary mt-4 generate-button"
      >
        Generate PDF
      </button>
    </Container>
  );
};

export default ViewInvoice;
