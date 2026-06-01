import mongoose, { Schema, model } from 'mongoose';

export interface ILecturer {
    fullName: string;
    email: string;
    password: string;
    lecturerId: string;
    department: mongoose.Schema.Types.ObjectId;
    role: 'lecturer';
}

const lecturerSchema = new Schema<ILecturer>({
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
    lecturerId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    role:{
        type: String,
        default: 'lecturer'
    }
}, {timestamps: true});

export const Lecturer  = model<ILecturer>('Lecturer', lecturerSchema);
