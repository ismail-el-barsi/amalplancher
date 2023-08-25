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
import AP from "../logo/AP.png";
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
  const [montantEnEspece, setMontantEnEspece] = useState(0);
  const [montantDeCheque, setMontantDeCheque] = useState(0);
  const [numCheque, setNumCheque] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/factures/${invoiceId}`);
        setClient(data.client);
        setIce(data.ice);
        const rawDate = new Date(data.date);
        const day = String(rawDate.getDate()).padStart(2, "0");
        const month = String(rawDate.getMonth() + 1).padStart(2, "0"); // JavaScript months are 0-indexed
        const year = rawDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

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
  const generatePDF = async () => {
    const pdfWidth = 190; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const input = invoiceRef.current;
    const scale = 7;
    // Generate a canvas from the HTML
    const canvas = await html2canvas(input, { scale: scale, useCORS: true });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4"); // Create an A4 size PDF

    const xOffset = 10; // Adjust this value to move the PDF left
    const yOffset = 5; // You can adjust this value if needed

    pdf.addImage(
      imgData,
      "JPEG",
      xOffset,
      yOffset,
      pdfWidth,
      (canvas.height * pdfWidth) / canvas.width
    );

    pdf.save("invoice.pdf");
  };

  const numberToFrenchWords = (number) => {
    if (number === 0) {
      return "zéro";
    }

    const [integerPart, decimalPart] = number.toString().split(".");
    let result = NumberToLetter(integerPart);

    if (decimalPart !== undefined) {
      const decimalWords =
        decimalPart.length === 1
          ? SingleDigitToFrenchWord(decimalPart)
          : NumberToLetter(decimalPart);
      result += ` dhirams ${decimalWords} centimes`;
    }

    return result;
  };

  const SingleDigitToFrenchWord = (digit) => {
    const singleDigitWords = {
      1: "dix",
      2: "vight ",
      3: "trente",
      4: "quarante",
      5: "cinquante",
      6: "soixante",
      7: "soixante-dix ",
      8: "quatre-vingts",
      9: "quatre-vingt-dix",
    };

    return singleDigitWords[digit];
  };
  function formatAmountInWords(amount) {
    const amountStr = amount.toFixed(2);
    const [wholePart, decimalPart] = amountStr.split(".");

    if (decimalPart === "00") {
      return `${numberToFrenchWords(wholePart)} dirhams`;
    } else {
      return numberToFrenchWords(amountStr);
    }
  }
  return (
    <>
      <Container
        ref={invoiceRef}
        className="p-3 mobile-container"
        style={{
          width: "190mm",
          height: "285mm",
          border: "1px solid black",
          padding: 0,
          margin: "auto",
          boxSizing: "border-box",
          transform: window.innerWidth <= 767 ? "scale(0.455)" : "none",
          transformOrigin: "top left",
          userSelect: "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: "67%",
            opacity: 0.3,
            zIndex: 1,
            backgroundImage: `url(${AP})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            top: "160px",
          }}
        />
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Form>
            <Card border="dark" style={{ height: "148px" }}>
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
                  <strong>Client(e):</strong> {client}
                </p>
                <p>
                  <strong>ICE:</strong> {ice}
                </p>
              </Card.Body>
            </Card>
            <Card className="mt-4 reduce-font-size" border="dark">
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
                  <div className="info-cell text-center3" style={{ flex: "3" }}>
                    <p>
                      <strong>MODE DE REGLEMENT:</strong>
                    </p>
                    {modeReglement === "chèque" && (
                      <>
                        <p>Chèque {numCheque}</p>
                      </>
                    )}
                    {modeReglement === "espèce" && (
                      <>
                        <p>Espèce:</p>
                      </>
                    )}
                    {modeReglement === "chèque et espèce" && (
                      <>
                        <p>Chèque {numCheque}</p>
                        <p>Espèce</p>
                      </>
                    )}
                  </div>
                  <div className="info-cell">
                    <p>
                      <strong>MONTANT:</strong>
                    </p>
                    {/* Display montantDeCheque or montantEnEspece based on modeReglement */}
                    {modeReglement === "chèque" && (
                      <p>{montantDeCheque.toFixed(2)}</p>
                    )}
                    {modeReglement === "espèce" && (
                      <p>{montantEnEspece.toFixed(2)}</p>
                    )}
                    {modeReglement === "chèque et espèce" && (
                      <>
                        <p>{montantDeCheque.toFixed(2)}</p>
                        <p>{montantEnEspece.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card.Body>
              <Card className="mt-4 reduce-font-size" border="dark">
                <Card.Body>
                  <div className="info-row" style={{ minHeight: "160px" }}>
                    <div className="info-cell" style={{ flex: "3.5" }}>
                      <p>
                        <strong>Designation:</strong>
                      </p>
                      <br></br>
                      <p>{designation}</p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Quantité:</strong>
                      </p>
                      <br></br>
                      <p>
                        {quantite} {unitOfMeasure}
                      </p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Prix Uni T.T.C:</strong>
                      </p>
                      <p>{prixUni.toFixed(2)}</p>
                    </div>
                    <div className="info-cell">
                      <p>
                        <strong>Total T.T.C:</strong>
                      </p>
                      <br></br>
                      <p>{totalTtc.toFixed(2)}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
            <Card className="mt-4 reduce-font-size text-center3" border="dark">
              <Card.Body>
                <div className="info-row">
                  <div className="info-cell">
                    <p>
                      <strong>Total H.T:</strong>
                    </p>
                    <p>{totalHt.toFixed(2)}</p>
                  </div>
                  <div className="info-cell">
                    <p>
                      <strong>Total TVA:</strong>
                    </p>
                    <p>{totalTva.toFixed(2)}</p>
                  </div>
                  <div className="info-cell">
                    <p>
                      <strong>Total T.T.C:</strong>
                    </p>
                    <p>{totalTtc.toFixed(2)}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <div
              className="container text-center2 mt-2"
              style={{ marginBottom: "70px" }}
            >
              <strong style={{ fontSize: "16px", textDecoration: "underline" }}>
                Arrêtée la présente facture à la somme de (T.T.C):
              </strong>
              <div style={{ fontSize: "16px" }}>
                <strong>{formatAmountInWords(totalTtc)}</strong>
              </div>
            </div>

            {/* Footer */}
            <Card className="mt-3" border="dark">
              <Card.Body className="text-center2" style={{ fontSize: "14px" }}>
                <p style={{ margin: "1px 0" }}>
                  <strong>-R.C :</strong> 24915- <strong>IF :</strong> 30715018-{" "}
                  <strong>-Patente :</strong> 22270237- <strong>CNSS :</strong>{" "}
                  7445457- <strong>Tel :</strong> 0661928486
                </p>
                <p style={{ margin: "1px 0" }}>
                  <strong>l.C.E:</strong> 000090460000040
                </p>
                <p style={{ margin: "1px 0" }}>
                  <strong>-Banque Populaire Souk el arbaâ du Gharb :</strong>{" "}
                  Compte N° :21211 9359664 001 4
                </p>
                <p>
                  <p>
                    <strong>-Siège social:</strong> Km 143, Route Rabat Tanger,
                    Province de Kenitra{" "}
                    <span className="text-decoration-underline">ARBAOUA</span>
                  </p>
                </p>
              </Card.Body>
            </Card>

            {/* Generate PDF button */}
          </Form>
        )}
      </Container>
      <div className="d-flex justify-content-center">
        <button
          onClick={generatePDF}
          className="btn btn-primary generate-button"
        >
          Generate PDF
        </button>
      </div>
    </>
  );
}
