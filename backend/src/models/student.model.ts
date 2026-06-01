import mongoose from 'mongoose';

export interface IStudent {
    fullName: string;
    email: string;
    password: string;
    matricNo: string;
    department: mongoose.Types.ObjectId;
    role: 'student';
}

const studentSchema = new mongoose.Schema<IStudent>({
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
    matricNo: {
        type: String,
        required: true,
        unique: true
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",

    },
    role: {
        type: String,
        default: 'student'
    }
}, { timestamps: true });

export const Student = mongoose.model<IStudent>('Student', studentSchema);