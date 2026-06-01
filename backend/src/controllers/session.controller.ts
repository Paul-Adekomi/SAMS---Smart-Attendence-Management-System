import { Request, Response } from "express";
import { Session } from "../models/session.model";
import { Course } from "../models/course.model";
import { Attendance } from "../models/attendance.model";
import { generateSessionCode } from "../utils/generateCode";
import QRCode from 'qrcode';

export interface AuthRequest extends Request {
    user?: any
}

export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, duration } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.id.toString() !== course.lecturer.toString())
            return res.status(403).json({ message: 'You are not assigned to this course' });

        if (!duration) return res.status(400).json({ message: "Duration is required" });
        if (duration < 1 || duration > 120)
            return res.status(400).json({ message: "Duration must be between 1 and 120 minutes" });

        const expiresAt = new Date(Date.now() + duration * 60 * 1000);
        const code = generateSessionCode();

        const session = await Session.create({
            course: courseId,
            lecturer: req.user.id,
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

export const getActiveSessions = async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await Session.find({
            expiresAt: { $gt: new Date() }
        }).populate("course").populate("lecturer");
        res.json(sessions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

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

export const getLecturerCourses = async (req: AuthRequest, res: Response) => {
    try {
        const courses = await Course.find({ lecturer: req.user.id });
        res.json(courses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// New feature: Attendance reports for a lecturer — all sessions with attendance counts
export const getLecturerReports = async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await Session.find({ lecturer: req.user.id })
            .populate('course')
            .sort({ createdAt: -1 });

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

// Get detailed attendance list for a specific session
export const getSessionAttendanceReport = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId).populate('course') as any;
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Only the lecturer who owns it can view the report
        if (session.lecturer.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const records = await Attendance.find({ session: sessionId, status: 'present' })
            .populate('student')
            .sort({ createdAt: 1 }) as any[];

        const data = records.map((a) => ({
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
