import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Student } from "../models/student.model";
import { Department } from "../models/department.model";
import { Course } from "../models/course.model";
import { Session } from "../models/session.model";
import { Attendance } from "../models/attendance.model";

export interface AuthRequest extends Request {
  user?: any;
}

// ─── DEPARTMENTS ─────────────────────────────────────────
export const getDepartments = async (_req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── COURSES ─────────────────────────────────────────────
export const getCoursesByDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId } = req.params;
    const courses = await Course.find({ department: departmentId as any }).sort({ courseCode: 1 });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCourses = async (_req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find().populate("department").sort({ courseCode: 1 });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseTitle, courseCode, departmentId, creditUnit, semester, level, description } = req.body;

    if (!courseTitle || !courseCode || !departmentId || !creditUnit || !semester || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    const existing = await Course.findOne({ courseCode: String(courseCode).toUpperCase() });
    if (existing) return res.status(400).json({ message: "A course with this code already exists" });

    const course = await Course.create({
      courseTitle,
      courseCode,
      description,
      creditUnit,
      semester,
      level: Array.isArray(level) ? level : [level],
      department: department._id,
    });

    return res.status(201).json({ message: "Course created", course });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── STUDENTS ────────────────────────────────────────────
export const getAllStudents = async (_req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find()
      .populate("department")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, matricNo, password, departmentId } = req.body;

    if (!fullName || !email || !matricNo || !password || !departmentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    const existing = await Student.findOne({ $or: [{ email }, { matricNo }] });
    if (existing) {
      return res.status(400).json({ message: "A student with this email or matric number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      fullName,
      email,
      matricNo,
      password: hashedPassword,
      department: department._id,
    });

    return res.status(201).json({
      message: "Student account created",
      student: { ...student.toObject(), password: undefined },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, matricNo, departmentId, isActive, password } = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (email || matricNo) {
      const existing = await Student.findOne({
        _id: { $ne: id },
        $or: [...(email ? [{ email }] : []), ...(matricNo ? [{ matricNo }] : [])],
      });
      if (existing) {
        return res.status(400).json({ message: "Another student already uses this email or matric number" });
      }
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) return res.status(404).json({ message: "Department not found" });
      student.department = department._id as any;
    }

    if (fullName) student.fullName = fullName;
    if (email) student.email = email;
    if (matricNo) student.matricNo = matricNo;
    if (typeof isActive === "boolean") student.isActive = isActive;
    if (password) student.password = await bcrypt.hash(password, 10);

    await student.save();

    return res.json({
      message: "Student updated",
      student: { ...student.toObject(), password: undefined },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Soft delete — keeps attendance history intact, just blocks login & hides from active lists
export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isActive = false;
    await student.save();

    return res.json({ message: "Student account deactivated", student });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// A single student's full attendance history (used for the admin's "search a student" drill-down)
export const getStudentAttendanceHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate("department");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const records = await Attendance.find({ student: studentId })
      .populate({ path: "session", populate: { path: "course" } })
      .sort({ createdAt: -1 });

    const history = records.map((r: any) => ({
      recordId: r._id,
      status: r.status,
      date: r.createdAt,
      courseCode: r.session?.course?.courseCode || "—",
      courseTitle: r.session?.course?.courseTitle || "Unknown course",
    }));

    const presentCount = history.filter((h) => h.status === "present").length;

    return res.json({
      student: { _id: student._id, fullName: student.fullName, matricNo: student.matricNo, department: student.department },
      totalRecords: history.length,
      presentCount,
      history,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── WEEKLY ATTENDANCE REPORT (across all courses) ──────
export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, departmentId, courseId } = req.query as {
      from?: string;
      to?: string;
      departmentId?: string;
      courseId?: string;
    };

    if (!from || !to) {
      return res.status(400).json({ message: "from and to dates are required (YYYY-MM-DD)" });
    }
    if (!departmentId) {
      return res.status(400).json({ message: "departmentId is required" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // include the whole "to" day

    // Find the course IDs in scope first, so the report only ever shows
    // sessions for the selected department (and course, if narrowed further).
    const courseQuery: any = { department: departmentId };
    if (courseId) courseQuery._id = courseId;
    const scopedCourses = await Course.find(courseQuery).select("_id");
    const scopedCourseIds = scopedCourses.map((c) => c._id);

    if (scopedCourseIds.length === 0) {
      return res.json({ from, to, totalSessions: 0, totalPresentMarks: 0, sessions: [] });
    }

    const sessions = await Session.find({
      createdAt: { $gte: fromDate, $lte: toDate },
      course: { $in: scopedCourseIds },
    })
      .populate("course")
      .sort({ createdAt: 1 }) as any[];

    const rows = await Promise.all(
      sessions.map(async (session) => {
        const presentCount = await Attendance.countDocuments({
          session: session._id,
          status: "present",
        });
        return {
          sessionId: session._id,
          date: session.createdAt,
          courseCode: session.course?.courseCode || "—",
          courseTitle: session.course?.courseTitle || "Unknown course",
          presentCount,
        };
      })
    );

    const totalPresentMarks = rows.reduce((sum, r) => sum + r.presentCount, 0);

    return res.json({
      from,
      to,
      totalSessions: rows.length,
      totalPresentMarks,
      sessions: rows,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
