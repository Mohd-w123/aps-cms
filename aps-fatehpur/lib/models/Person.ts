import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPerson extends Document {
  schoolId: Types.ObjectId;
  role: "director" | "chairman" | "principal";
  name: string;
  designation: string;
  bio: string;
  photo?: string;
  qualifications?: string;
  order: number;
  isActive: boolean;
}

const PersonSchema = new Schema<IPerson>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    role: {
      type: String,
      enum: ["director", "chairman", "principal"],
      required: true,
    },
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    bio: { type: String, default: "" },
    photo: { type: String },
    qualifications: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema);
