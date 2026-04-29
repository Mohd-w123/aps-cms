import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAICU extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description: string;
  services: { name: string; description: string; icon: string }[];
  images: string[];
  schedule?: string;
  isActive: boolean;
}

const AICUSchema = new Schema<IAICU>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    services: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        icon: { type: String, default: "" },
      },
    ],
    images: [{ type: String }],
    schedule: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.AICU || mongoose.model<IAICU>("AICU", AICUSchema);
