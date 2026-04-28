import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGallery extends Document {
  schoolId: Types.ObjectId;
  type: "photo" | "video";
  title: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  order: number;
  isPublished: boolean;
}

const GallerySchema = new Schema<IGallery>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    type: {
      type: String,
      enum: ["photo", "video"],
      default: "photo",
    },
    title: { type: String, default: "" },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    category: { type: String, default: "general" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
