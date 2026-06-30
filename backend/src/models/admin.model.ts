import mongoose, { Schema, model } from 'mongoose';

export interface IAdmin {
    fullName: string;
    email: string;
    password: string;
    adminId: string;
    role: 'admin';
}

const adminSchema = new Schema<IAdmin>({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    adminId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

export const Admin = model<IAdmin>('Admin', adminSchema);
