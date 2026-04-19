import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"],
    },
    paymentType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly", "custom"],
      required: [true, "Payment type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    amountDue: {
      type: Number,
      required: [true, "Amount due is required"],
      min: [0, "Amount due must be at least 0"],
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, "Total paid must be at least 0"],
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: [0, "Outstanding balance must be at least 0"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "overdue", "cancelled"],
      default: "active",
    },
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBeforeDue: {
        type: Number,
        default: 3,
      },
    },
  },
  {
    timestamps: true,
  }
);

agreementSchema.pre("save", function updateOutstandingBalance(next) {
  this.outstandingBalance = Math.max(this.amountDue - this.totalPaid, 0);
  next();
});

const Agreement = mongoose.model("Agreement", agreementSchema);

export default Agreement;
