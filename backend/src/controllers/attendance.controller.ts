import { Request, Response } from "express";
import { Attendance } from "../models/attendance.model";
import { Session } from "../models/session.model";
import { Student } from "../models/student.model";
import { io } from "../server";
import { Parser } from "json2csv";
import ExcelJs from "exceljs";

export interface AuthRequest extends Request {
  user?: any;
}

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, code } = req.body;

    if (!sessionId || !code) {
      return res.status(400).json({ message: "SessionID and code are required" });
    }

    const session = await Session.findById(sessionId) as any;
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (new Date() > session.expiresAt) return res.status(400).json({ message: "Attendance session expired" });
    if (session.code !== code) return res.status(400).json({ message: "Invalid attendance code" });

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(400).json({ message: "Student not found" });

    const alreadyMarked = await Attendance.findOne({ student: req.user.id, session: sessionId });
    if (alreadyMarked) return res.status(400).json({ message: "Attendance already marked" });

    const attendance = await Attendance.create({
      student: req.user.id,
      session: sessionId,
      status: "present",
    });

    const count = await Attendance.countDocuments({ session: session._id });

    io.to(session._id.toString()).emit("attendance updated", {
      sessionId: session._id,
      count,
    });

    return res.status(201).json({ message: "Attendance marked successfully", attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance list for a session (for the lecturer's live view)
export const getSessionAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const records = await Attendance.find({ session: sessionId }).populate("student");
    const data = records.map((a: any) => ({
      studentName: a.student.fullName,
      matricNo: a.student.matricNo,
      time: new Date(a.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Student's own attendance history
export const getMyHistory = async (req: AuthRequest, res: Response) => {
  try {
    const records = await Attendance.find({ student: req.user.id })
      .populate({ path: "session", populate: { path: "course" } })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const attendance = await Attendance.find({ session: sessionId }).populate("student");
    const data = attendance.map((a: any) => ({
      fullName: a.student.fullName,
      matricNo: a.student.matricNo,
      time: a.createdAt,
    }));
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment("attendance.csv");
    return res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const attendance = await Attendance.find({ session: sessionId }).populate("student");
    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet("Attendance");
    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Matric Number", key: "matric", width: 20 },
      { header: "Time", key: "time", width: 30 },
    ];
    attendance.forEach((a: any) => {
      sheet.addRow({ name: a.student.fullName, matric: a.student.matricNo, time: a.createdAt });
    });
    res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const attendance = await Attendance.find({ student: req.user.id })
            .populate({
                path: 'session',
                populate: { path: 'course'}
            })
            .sort({ createdAt: -1 });
        res.json(attendance);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
