import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  schoolId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "school_admin" | "editor";
  lastLogin?: Date;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["superadmin", "school_admin", "editor"],
      default: "editor",
    },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
