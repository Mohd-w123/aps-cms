import { z } from "zod";

// ── Pages ──
export const pageCreateSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  content: z.string().optional().default(""),
  featuredImage: z.string().url().optional().or(z.literal("")),
  seo: z.object({
    metaTitle: z.string().max(200).optional(),
    metaDescription: z.string().max(500).optional(),
  }).optional(),
  isPublished: z.boolean().optional().default(false),
});
export const pageUpdateSchema = pageCreateSchema.partial();

// ── Persons ──
export const personSchema = z.object({
  role: z.enum(["director", "chairman", "principal"]),
  name: z.string().min(1).max(200),
  designation: z.string().max(200).optional().default(""),
  bio: z.string().optional().default(""),
  photo: z.string().optional().or(z.literal("")),
  qualifications: z.string().optional(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});
export const personUpdateSchema = personSchema.partial();

// ── News ──
export const newsCreateSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  content: z.string().optional().default(""),
  category: z.enum(["announcement", "event", "tour"]).optional().default("announcement"),
  featuredImage: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional(),
});
export const newsUpdateSchema = newsCreateSchema.partial();

// ── Gallery ──
export const galleryCreateSchema = z.object({
  image: z.string().min(1),
  order: z.number().int().optional().default(0),
  isPublished: z.boolean().optional().default(true),
});
export const galleryUpdateSchema = galleryCreateSchema.partial();

// ── Toppers ──
export const topperCreateSchema = z.object({
  image: z.string().min(1),
  order: z.number().int().optional().default(0),
  isPublished: z.boolean().optional().default(true),
});
export const topperUpdateSchema = topperCreateSchema.partial();

// ── AICU ──
export const aicuSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional().default(""),
  services: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional().default(""),
    icon: z.string().optional().default(""),
  })).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  schedule: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});
export const aicuUpdateSchema = aicuSchema.partial();

// ── Admissions ──
export const admissionCreateSchema = z.object({
  studentName: z.string().min(1).max(200),
  parentName: z.string().min(1).max(200),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  class: z.string().min(1).max(50),
  dob: z.string().datetime().or(z.string().min(1)),
  gender: z.string().min(1).max(20),
  address: z.string().min(1).max(500),
  previousSchool: z.string().max(200).optional(),
  documents: z.array(z.object({
    name: z.string().min(1),
    url: z.string().min(1),
  })).optional().default([]),
});
export const admissionStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
});

// ── Enquiries ──
export const enquiryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  subject: z.string().min(1).max(300),
  message: z.string().min(1).max(2000),
});
export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "read", "replied"]),
});

// ── Careers ──
export const careerCreateSchema = z.object({
  title: z.string().min(1).max(500),
  department: z.string().max(200).optional().default(""),
  description: z.string().optional().default(""),
  qualifications: z.string().optional().default(""),
  experience: z.string().optional().default(""),
  salary: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  deadline: z.string().datetime().optional(),
});
export const careerUpdateSchema = careerCreateSchema.partial();

// ── Career Applications ──
export const careerApplySchema = z.object({
  careerId: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  resume: z.string().min(1),
  coverLetter: z.string().max(2000).optional(),
});

// ── Alumni ──
export const alumniCreateSchema = z.object({
  name: z.string().min(1).max(200),
  batch: z.string().min(1).max(50),
  course: z.string().max(200).optional().default(""),
  currentRole: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  photo: z.string().optional(),
  testimonial: z.string().max(2000).optional(),
});
export const alumniUpdateSchema = alumniCreateSchema.partial().extend({
  isApproved: z.boolean().optional(),
});

// ── Users ──
export const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["superadmin", "school_admin", "editor"]),
  schoolId: z.string().min(1),
  isActive: z.boolean().optional().default(true),
});
export const userUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(["superadmin", "school_admin", "editor"]).optional(),
  isActive: z.boolean().optional(),
});

// ── Schools ──
export const schoolUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional(),
  }).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    mapEmbed: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
  stats: z.object({
    students: z.number().optional(),
    teachers: z.number().optional(),
    years: z.number().optional(),
    awards: z.number().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});
