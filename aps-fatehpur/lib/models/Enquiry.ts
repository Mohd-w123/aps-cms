import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEnquiry extends Document {
  schoolId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  sentToSales?: boolean;
  sentToSalesAt?: Date;
  sentToSalesBy?: Types.ObjectId;
  salesPersonId?: Types.ObjectId;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
    sentToSales: { type: Boolean, default: false },
    sentToSalesAt: { type: Date },
    sentToSalesBy: { type: Schema.Types.ObjectId, ref: "User" },
    salesPersonId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EnquirySchema.index({ schoolId: 1, status: 1 });

export default mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
