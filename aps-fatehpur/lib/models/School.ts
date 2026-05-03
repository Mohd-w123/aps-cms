import mongoose, { Schema, Document } from "mongoose";

export interface ISchool extends Document {
  name: string;
  slug: string;
  domain: string;
  subdomain?: string;
  logo: string;
  favicon: string;
  cardImage?: string;
  cardBgColor?: string;
  websiteUrl?: string;
  description?: string;
  tagline?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    mapEmbed?: string;
    officeHours?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  stats: {
    students: number;
    teachers: number;
    years: number;
    awards: number;
  };
  isActive: boolean;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    domain: { type: String, required: true },
    subdomain: { type: String },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    cardImage: { type: String, default: "" },
    cardBgColor: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    tagline: { type: String, default: "" },
    theme: {
      primaryColor: { type: String, default: "#2F3E8F" },
      secondaryColor: { type: String, default: "#1a2556" },
      accentColor: { type: String, default: "#F4D21F" },
    },
    contactInfo: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      mapEmbed: { type: String },
      officeHours: { type: String, default: "" },
    },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      twitter: { type: String },
    },
    stats: {
      students: { type: Number, default: 0 },
      teachers: { type: Number, default: 0 },
      years: { type: Number, default: 0 },
      awards: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);
