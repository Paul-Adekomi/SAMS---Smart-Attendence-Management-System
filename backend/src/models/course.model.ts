import mongoose, { Schema, model } from "mongoose";

export interface ICourse {
    courseTitle: string;
    courseCode: string;
    description?: string;
    creditUnit: number;
    semester: "first" | "second";
    level: [string];
    department: mongoose.Schema.Types.ObjectId;
    lecturer: mongoose.Schema.Types.ObjectId;
    isActive: boolean;
}

const courseSchema = new Schema<ICourse>({
    courseTitle:{
        type: String,
        required: true,
        trim: true,
    },
    courseCode:{
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description:{
        type: String,
    },
    creditUnit:{
        type: Number,
        required: true,
        min: 1,
    },
    level:{
        type: [String],
        trim: true,
    },
    lecturer:{
        type: Schema.Types.ObjectId,
        ref: "Lecturer"
    },
    semester:{
        type: String
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    }
})

export const Course = model<ICourse>('Course', courseSchema);