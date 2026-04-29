import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdmission extends Document {
  schoolId: Types.ObjectId;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  class: string;
  dob: Date;
  gender: string;
  address: string;
  previousSchool?: string;
  documents: { name: string; url: string }[];
  status: "pending" | "reviewed" | "accepted" | "rejected";
  appliedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentName: { type: String, required: true },
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    class: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    previousSchool: { type: String },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

AdmissionSchema.index({ schoolId: 1, status: 1 });

export default mongoose.models.Admission || mongoose.model<IAdmission>("Admission", AdmissionSchema);
