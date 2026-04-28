import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAlumni extends Document {
  schoolId: Types.ObjectId;
  name: string;
  batch: string;
  course: string;
  currentRole?: string;
  company?: string;
  photo?: string;
  testimonial?: string;
  isApproved: boolean;
}

const AlumniSchema = new Schema<IAlumni>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true },
    batch: { type: String, required: true },
    course: { type: String, default: "" },
    currentRole: { type: String },
    company: { type: String },
    photo: { type: String },
    testimonial: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AlumniSchema.index({ schoolId: 1, isApproved: 1 });

export default mongoose.models.Alumni || mongoose.model<IAlumni>("Alumni", AlumniSchema);
