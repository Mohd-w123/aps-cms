import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopper extends Document {
  schoolId: Types.ObjectId;
  name: string;
  photo: string;
  percentage: number;
  year: string;
  exam: string;
  rank: number;
  order: number;
  isPublished: boolean;
}

const TopperSchema = new Schema<ITopper>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    percentage: { type: Number, default: 0 },
    year: { type: String, default: "" },
    exam: { type: String, default: "Board" },
    rank: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TopperSchema.index({ schoolId: 1, order: 1 });

export default mongoose.models.Topper || mongoose.model<ITopper>("Topper", TopperSchema);
