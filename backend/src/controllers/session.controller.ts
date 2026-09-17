import { Request, Response } from "express";
import { Session } from "../models/session.model";
import { Course } from "../models/course.model";
import { Student } from "../models/student.model";
import { Attendance } from "../models/attendance.model";
import { generateSessionCode } from "../utils/generateCode";
import QRCode from 'qrcode';

export interface AuthRequest extends Request {
    user?: any
}

// Admin starts a new attendance session for a course
export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, duration } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (!duration) return res.status(400).json({ message: "Duration is required" });
        if (duration < 1 || duration > 120)
            return res.status(400).json({ message: "Duration must be between 1 and 120 minutes" });

        const expiresAt = new Date(Date.now() + duration * 60 * 1000);
        const code = generateSessionCode();

        const session = await Session.create({
            course: courseId,
            createdBy: req.user.id,
            code,
            expiresAt,
            semester: course.semester,
            level: Array.isArray(course.level) ? course.level[0] : course.level,
        });

        const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student?sessionId=${session._id}&code=${code}`;
        const qr = await QRCode.toDataURL(qrUrl);

        return res.status(201).json({
            message: "Session created",
            sessionId: session._id,
            code,
            expiresAt,
            qr,
            course: { courseTitle: course.courseTitle, courseCode: course.courseCode }
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const getActiveSessions = async (_req: AuthRequest, res: Response) => {
    try {
        const sessions = await Session.find({
            expiresAt: { $gt: new Date() }
        }).populate("course");
        res.json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Used by a student who typed a PIN instead of scanning the QR code
export const getSessionByCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.body;
        const session = await Session.findOne({
            code: code.toUpperCase(),
            expiresAt: { $gt: new Date() }
        });
        if (!session) return res.status(404).json({ message: 'Invalid or expired PIN' });
        res.json({ sessionId: session._id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// All courses, for the admin's "start a session" dropdown
export const getCourses = async (_req: AuthRequest, res: Response) => {
    try {
        const courses = await Course.find().populate('department').sort({ courseCode: 1 });
        res.json(courses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// All sessions (current + past), with attendance counts — the admin's session history
export const getAllSessions = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.query as { courseId?: string };
        const query: any = {};
        if (courseId) query.course = courseId;

        const sessions = await Session.find(query).populate('course').sort({ createdAt: -1 });

        const reports = await Promise.all(sessions.map(async (session: any) => {
            const count = await Attendance.countDocuments({ session: session._id, status: 'present' });
            return {
                sessionId: session._id,
                courseTitle: session.course?.courseTitle || 'Unknown',
                courseCode: session.course?.courseCode || '',
                date: session.createdAt,
                expiresAt: session.expiresAt,
                presentCount: count,
                isExpired: new Date() > session.expiresAt,
            };
        }));

        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Detailed "who was present" list for a specific session
export const getSessionAttendanceReport = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId).populate('course') as any;
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const records = await Attendance.find({ session: sessionId, status: 'present' })
            .populate('student')
            .sort({ createdAt: 1 }) as any[];

        const data = records.map((a) => ({
            studentId: a.student?._id,
            studentName: a.student?.fullName || 'Unknown',
            matricNo: a.student?.matricNo || '',
            time: new Date(a.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        }));

        res.json({
            courseTitle: session.course?.courseTitle,
            courseCode: session.course?.courseCode,
            date: session.createdAt,
            totalPresent: data.length,
            students: data,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Full roster for a session: every active student in the course's department,
// each tagged with their current status for that session (present / absent / unmarked).
// This backs the admin's manual roll-call view.
export const getSessionRoster = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId).populate('course') as any;
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const departmentId = session.course?.department;
        const students = await Student.find({ department: departmentId, isActive: true }).sort({ fullName: 1 });

        const records = await Attendance.find({ session: sessionId });
        const statusByStudent = new Map(records.map((r: any) => [r.student.toString(), r.status]));

        const roster = students.map((s: any) => ({
            studentId: s._id,
            fullName: s.fullName,
            matricNo: s.matricNo,
            status: statusByStudent.get(s._id.toString()) || 'unmarked',
        }));

        res.json({
            sessionId,
            courseTitle: session.course?.courseTitle,
            courseCode: session.course?.courseCode,
            isExpired: new Date() > session.expiresAt,
            roster,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Admin manually marks or updates a student's attendance for a session
export const setAttendanceStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId, studentId } = req.params;
        const { status } = req.body;

        if (!['present', 'absent'].includes(status)) {
            return res.status(400).json({ message: "status must be 'present' or 'absent'" });
        }

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const attendance = await Attendance.findOneAndUpdate(
            { session: sessionId, student: studentId },
            { $set: { status } },
            { upsert: true, new: true }
        );

        res.json({ message: 'Attendance updated', attendance });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
