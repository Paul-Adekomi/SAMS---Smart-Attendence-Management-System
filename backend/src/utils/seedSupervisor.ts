import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { Department } from "../models/department.model";
import { Course } from "../models/course.model";
import { Lecturer } from "../models/lecturer.model";
import { Admin } from "../models/admin.model";

import setup from "../data/supervisor-setup.json";

dotenv.config();

// Seeds ONLY real data for her instance: her department, her admin account,
// her lecturer account, and the courses she teaches.
// Does NOT touch students — she creates those herself through the Admin dashboard.
export const seedSupervisor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("🌱 Seeding Database Connected ✅");

    const department = await Department.findOneAndUpdate(
      { name: setup.department.name },
      { $set: setup.department },
      { upsert: true, new: true }
    );
    console.log("🌱 Department seeded ✅");

    const hashedAdminPassword = await bcrypt.hash(setup.admin.password, 10);
    await Admin.updateOne(
      { adminId: setup.admin.adminId },
      {
        $set: {
          fullName: setup.admin.fullName,
          email: setup.admin.email,
          password: hashedAdminPassword,
          adminId: setup.admin.adminId,
        },
      },
      { upsert: true }
    );
    console.log("🌱 Admin account seeded ✅");

    const hashedLecturerPassword = await bcrypt.hash(setup.lecturer.password, 10);
    const lecturer = await Lecturer.findOneAndUpdate(
      { lecturerId: setup.lecturer.lecturerId },
      {
        $set: {
          fullName: setup.lecturer.fullName,
          email: setup.lecturer.email,
          password: hashedLecturerPassword,
          lecturerId: setup.lecturer.lecturerId,
          department: department._id,
        },
      },
      { upsert: true, new: true }
    );
    console.log("🌱 Lecturer account seeded ✅");

    for (const course of setup.courses) {
      await Course.updateOne(
        { courseCode: course.courseCode },
        {
          $set: {
            courseTitle: course.courseTitle,
            creditUnit: course.creditUnit,
            semester: course.semester,
            level: course.level,
            department: department._id,
            lecturer: lecturer._id,
          },
        },
        { upsert: true }
      );
    }
    console.log("🌱 Courses seeded ✅");

    console.log("🌱 Supervisor instance seeded successfully ✅");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSupervisor();
