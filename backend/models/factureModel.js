import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    client: { type: String, required: true },
    ice: { type: String, required: true },
    date: { type: Date, required: true },
    numero: { type: String, required: true },
    totalHt: { type: Number, required: true },
    modeReglement: { type: String, required: true },
    quantite: { type: Number, required: true },
    montant: { type: Number, required: true },
    totalTtc: { type: Number, required: true },
    designation: { type: String, required: true },
    totalTva: { type: Number, required: true },
    prixUni: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Facture = mongoose.model("Facture", invoiceSchema);
export default Facture;
