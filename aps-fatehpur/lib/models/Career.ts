import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICareer extends Document {
  schoolId: Types.ObjectId;
  title: string;
  department: string;
  description: string;
  qualifications: string;
  experience: string;
  salary?: string;
  isActive: boolean;
  deadline?: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true },
    department: { type: String, default: "" },
    description: { type: String, default: "" },
    qualifications: { type: String, default: "" },
    experience: { type: String, default: "" },
    salary: { type: String },
    isActive: { type: Boolean, default: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Career || mongoose.model<ICareer>("Career", CareerSchema);
