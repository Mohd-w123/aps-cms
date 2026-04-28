import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICareerApplication extends Document {
  careerId: Types.ObjectId;
  schoolId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter?: string;
  status: "pending" | "shortlisted" | "rejected";
  appliedAt: Date;
}

const CareerApplicationSchema = new Schema<ICareerApplication>(
  {
    careerId: { type: Schema.Types.ObjectId, ref: "Career", required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.CareerApplication ||
  mongoose.model<ICareerApplication>("CareerApplication", CareerApplicationSchema);
