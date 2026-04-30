import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGallery extends Document {
  schoolId: Types.ObjectId;
  image: string;
  order: number;
  isPublished: boolean;
}

const GallerySchema = new Schema<IGallery>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
