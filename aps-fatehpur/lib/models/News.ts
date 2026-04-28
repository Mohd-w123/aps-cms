import mongoose, { Schema, Document, Types } from "mongoose";

export interface INews extends Document {
  schoolId: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  category: "announcement" | "event" | "tour";
  featuredImage?: string;
  images: string[];
  isPublished: boolean;
  publishedAt?: Date;
}

const NewsSchema = new Schema<INews>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, default: "" },
    category: {
      type: String,
      enum: ["announcement", "event", "tour"],
      default: "announcement",
    },
    featuredImage: { type: String },
    images: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

NewsSchema.index({ schoolId: 1, slug: 1 }, { unique: true });

export default mongoose.models.News || mongoose.model<INews>("News", NewsSchema);
