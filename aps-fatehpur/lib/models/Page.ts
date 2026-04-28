import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPage extends Document {
  schoolId: Types.ObjectId;
  slug: string;
  title: string;
  content: string;
  featuredImage?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isPublished: boolean;
  updatedBy?: Types.ObjectId;
}

const PageSchema = new Schema<IPage>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    featuredImage: { type: String },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PageSchema.index({ schoolId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
