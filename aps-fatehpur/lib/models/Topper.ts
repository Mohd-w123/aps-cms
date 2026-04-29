import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopper extends Document {
  schoolId: Types.ObjectId;
  studentName: string;
  photo?: string;
  class: string;
  year: number;
  rank: number;
  percentage: number;
  examName: string;
  subjects: { name: string; marks: number }[];
  isPublished: boolean;
}

const TopperSchema = new Schema<ITopper>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    studentName: { type: String, required: true },
    photo: { type: String },
    class: { type: String, required: true },
    year: { type: Number, required: true },
    rank: { type: Number, required: true },
    percentage: { type: Number, required: true },
    examName: { type: String, default: "" },
    subjects: [
      {
        name: { type: String, required: true },
        marks: { type: Number, required: true },
      },
    ],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TopperSchema.index({ schoolId: 1, year: -1, rank: 1 });

export default mongoose.models.Topper || mongoose.model<ITopper>("Topper", TopperSchema);
