import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Tenant full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Tenant phone is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Tenant email is required"],
      trim: true,
      lowercase: true,
    },
    alternateName: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;
