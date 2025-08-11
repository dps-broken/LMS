// /server/models/Document.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['certificate', 'offer_letter'], required: true },
  title: { type: String, required: true }, // e.g., "Internship Offer Letter", "Web Development Certificate"
  fileUrl: { type: String, required: true }, // URL to the generated PDF
  issueDate: { type: Date, default: Date.now },
  batchName: { type: String }, // For display on the document
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;

