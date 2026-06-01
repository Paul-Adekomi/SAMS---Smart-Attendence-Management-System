import { Schema, model } from "mongoose";

export interface IDepartment {
    name: string;
    description?: string;
}

const departmentSchema = new Schema<IDepartment>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const Department = model<IDepartment>('Department', departmentSchema);