import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Shop } from "../Shop";
import { getError } from "../Utils";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import LoadingBox from "../component/Loading";
import MessageBox from "../component/MessageError";
import { Card } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../logo/logo2.png";
import { NumberToLetter } from "convertir-nombre-lettre";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ViewInvoicePage() {
  const params = useParams();
  const { id: invoiceId } = params;

  const { etat } = useContext(Shop);
  const { userInfo } = etat;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const invoiceRef = useRef(null);
  const [montant, setMontant] = useState(0); // Add this line
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
  const generatePDF = async () => {
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const input = invoiceRef.current;
    const scale = 7;

    const generateButton = input.querySelector(".generate-button");
    generateButton.style.display = "none";

    // Generate a canvas from the HTML
    const canvas = await html2canvas(input, { scale: scale, useCORS: true });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4"); // Create an A4 size PDF

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      pdfWidth,
      (canvas.height * pdfWidth) / canvas.width
    );

    pdf.save("invoice.pdf");

    generateButton.style.display = "block";
  };
  const numberToFrenchWords = (number) => {
    if (number === 0) {
      return "zéro";
    }

    const [integerPart, decimalPart] = number.toString().split(".");
    let result = NumberToLetter(integerPart);

    if (decimalPart !== undefined) {
      const decimalWords = NumberToLetter(decimalPart);
      result += ` virgule ${decimalWords}`;
    }

    return result;
  };

  return (
    <Container
      ref={invoiceRef}
      className="p-3 mobile-container"
      style={{
        width: "210mm",
        height: "297mm",
        border: "1px solid black",
        padding: 0,
        margin: "auto",
        boxSizing: "border-box",
        transform: window.innerWidth <= 767 ? "scale(0.455)" : "none", // Adjust the scale value as needed
        transformOrigin: "top left",
        userSelect: "none",
      }}
    >
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form>
          <Card border="dark" style={{ height: "140px" }}>
            <div className="invoice-header text-center2 mb-4 d-flex align-items-center">
              <div className="logo">
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: "110px",
                    height: "100px",
                    marginBottom: "50px",
                  }}
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
            <h2 className="text-primary text-center2 text-decoration-underline fs-2">
              FACTURE
            </h2>
            <Card.Body>
              <p>
                <strong>Client:</strong> {client}
              </p>
              <p>
                <strong>ICE:</strong> {ice}
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
                  <p>{numero}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>Date:</strong>
                  </p>
                  <p>{date}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>MODE DE REGLEMENT:</strong>
                  </p>
                  <p>{modeReglement}</p>
                </div>
                <div className="info-cell">
                  <p>
                    <strong>MONTANT:</strong>
                  </p>
                  <p>{totalTtc}</p>
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
                      <p>{designation}</p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Quantité:</strong>
                      </p>
                      <p>{quantite}</p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Prix Uni T.T.C:</strong>
                      </p>
                      <p>{prixUni}</p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Total T.T.C:</strong>
                      </p>
                      <p>{totalTtc}</p>
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
                    <p>{totalHt}</p>
                  </div>
                  <div className="info-cell">
                    <p>
                      <strong>Total TVA:</strong>
                    </p>
                    <p>{totalTva}</p>
                  </div>
                  <div className="info-cell">
                    <p>
                      <strong>Total T.T.C:</strong>
                    </p>
                    <p>{totalTtc}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Card>
          <div className="container text-center2 mt-5">
            <strong>
              Arrêtée la présente facture à la somme de (T.T.C):
              {numberToFrenchWords(totalTtc)}
            </strong>
          </div>
          {/* Footer */}
          <Card className="mt-4" border="dark">
            <Card.Body className="text-center2 small-font">
              <p>
                <strong>R.C :</strong> 24915- <strong>IF :</strong> 30715018-{" "}
                <strong>Patente :</strong> 22270237- <strong>CNSS :</strong>{" "}
                7445457- <strong>Tel :</strong> 0661928486
              </p>
              <p>
                <strong>l.C.E:</strong> 000090460000040
              </p>
              <p>
                <strong>Banque Populaire Souk el arbaâ du Gharb :</strong>{" "}
                Compte NO :21211 9359664 001 4
              </p>
              <p>
                <strong>Siège social:</strong> Km 143, Route Rabat Tanger,
                Province de Kenitra ARBAOUA
              </p>
            </Card.Body>
          </Card>

          {/* Generate PDF button */}
        </Form>
      )}
      <button
        onClick={generatePDF}
        className="btn btn-primary mt-4 generate-button"
      >
        Generate PDF
      </button>
    </Container>
  );
}
