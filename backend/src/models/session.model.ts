import mongoose, { Types } from "mongoose";

export interface ISession {
    course: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    date: Date;
    code: string;
    isActive: boolean;
    expiresAt: Date;
    semester: string;
    level: string;
}

const sessionSchema = new mongoose.Schema<ISession>({
    course: {
        type: Types.ObjectId,
        ref: "Course",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    date: {
        type: Date,
        default: Date.now
    },
    code: {
        type: String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    expiresAt:{
        type: Date,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Session = mongoose.model<ISession>("Session", sessionSchema);
