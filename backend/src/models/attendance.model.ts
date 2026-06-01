import mongoose, { Types } from "mongoose";

export interface IAttendance {
  student: Types.ObjectId;
  session: Types.ObjectId;
  status: "present" | "absent";
}

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  status: { type: String, enum: ["present", "absent"], default: "absent" },
}, { timestamps: true });

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);
