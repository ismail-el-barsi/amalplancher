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
  },
  { _id: false } // We don't want Mongoose to automatically generate IDs for subdocuments
);

const invoiceSchema = new mongoose.Schema(
  {
    client: { type: String, required: true },
    ice: { type: String, required: true },
    date: { type: Date, required: true },
    numero: { type: String, required: true },
    designations: [designationSchema], // Array of subdocuments
  },
  {
    timestamps: true,
  }
);

const Facture = mongoose.model("Facture", invoiceSchema);
export default Facture;
