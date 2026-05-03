import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISlider extends Document {
  schoolId: Types.ObjectId;
  image: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaLink?: string;
  order: number;
  isPublished: boolean;
  scope: "school" | "group";
}

const SliderSchema = new Schema<ISlider>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    ctaLabel: { type: String },
    ctaLink: { type: String },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    scope: { type: String, enum: ["school", "group"], default: "school" },
  },
  { timestamps: true }
);

export default mongoose.models.Slider || mongoose.model<ISlider>("Slider", SliderSchema);
