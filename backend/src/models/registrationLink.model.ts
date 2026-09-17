import mongoose, { Schema, model, Types } from "mongoose";

export interface IRegistrationLink {
    token: string;
    department: Types.ObjectId;
    expiresAt: Date;
    isRevoked: boolean;
    createdBy: Types.ObjectId;
}

const registrationLinkSchema = new Schema<IRegistrationLink>({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
}, { timestamps: true });

export const RegistrationLink = model<IRegistrationLink>("RegistrationLink", registrationLinkSchema);
