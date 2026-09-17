export type Department = { _id: string; name: string; faculty?: string; description?: string };

export type Course = {
  _id: string;
  courseTitle: string;
  courseCode: string;
  creditUnit: number;
  semester: "first" | "second";
  level: string[];
  department?: Department;
};

export type Student = {
  _id: string;
  fullName: string;
  email: string;
  matricNo: string;
  isActive: boolean;
  department?: Department;
  createdAt?: string;
};

export type SessionSummary = {
  sessionId: string;
  courseTitle: string;
  courseCode: string;
  date: string;
  expiresAt: string;
  presentCount: number;
  isExpired: boolean;
};

export type SessionCreated = {
  sessionId: string;
  code: string;
  qr: string;
  expiresAt: string;
  course: { courseTitle: string; courseCode: string };
};

export type RosterEntry = {
  studentId: string;
  fullName: string;
  matricNo: string;
  status: "present" | "absent" | "unmarked";
};

export type SessionRoster = {
  sessionId: string;
  courseTitle: string;
  courseCode: string;
  isExpired: boolean;
  roster: RosterEntry[];
};

export type SessionReport = {
  courseTitle: string;
  courseCode: string;
  date: string;
  totalPresent: number;
  students: { studentId: string; studentName: string; matricNo: string; time: string }[];
};

export type ReportRow = {
  sessionId: string;
  date: string;
  courseCode: string;
  courseTitle: string;
  presentCount: number;
};

export type WeeklyReport = {
  from: string;
  to: string;
  totalSessions: number;
  totalPresentMarks: number;
  sessions: ReportRow[];
};

export type RegistrationLinkStatus = "active" | "expired" | "revoked";

export type RegistrationLink = {
  _id: string;
  token: string;
  department: Department;
  expiresAt: string;
  isRevoked: boolean;
  status: RegistrationLinkStatus;
  createdAt: string;
};

export type StudentAttendanceHistory = {
  student: { _id: string; fullName: string; matricNo: string; department?: Department };
  totalRecords: number;
  presentCount: number;
  history: { recordId: string; status: "present" | "absent"; date: string; courseCode: string; courseTitle: string }[];
};

export type AttendanceRecord = {
  _id: string;
  status: "present" | "absent";
  createdAt: string;
  session: {
    _id: string;
    course: { courseTitle: string; courseCode: string };
    expiresAt: string;
  };
};
