import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    designation: { type: String, required: true },
    prixUni: { type: Number, required: true },
    quantite: { type: Number, required: true },
    unitOfMeasure: { type: String, required: true },
    totalHt: { type: Number, required: true },
    modeReglement: { type: String, required: true },
    montant: { type: Number },
    totalTtc: { type: Number, required: true },
    totalTva: { type: Number, required: true },
    montantEnEspece: { type: Number },
    montantDeCheque: { type: Number },
    numCheque: { type: String },
    numEffet: { type: String },
    montantEffet: { type: Number },
    montantOrdreDeVirement: { type: Number },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    client: { type: String, required: true },
    ice: { type: String },
    date: { type: Date, required: true },
    numero: { type: String, required: true },
    designations: [designationSchema],
  },
  {
    timestamps: true,
  }
);

const Facture = mongoose.model("Facture", invoiceSchema);
export default Facture;
