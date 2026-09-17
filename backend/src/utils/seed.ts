import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";


import { Department } from "../models/department.model";
import { Course } from "../models/course.model";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";

import departmentsData from '../data/departments.json';
import coursesData from '../data/courses.json';
import studentsData from '../data/students.json';
import adminsData from '../data/admins.json';

dotenv.config();


export const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("🌱 Seeding Database Connected ✅");

        for (const dept of departmentsData) {
            await Department.updateOne(
                { name: dept.name },
                { $set: dept },
                { upsert: true }
            );
        };

        for (const stu of studentsData) {
            const department = await Department.findOne({
                name: stu.department,
            });

            if (!department) continue;

            const hashedPassword = await bcrypt.hash(stu.password, 10);

            await Student.updateOne(
                { matricNo: stu.matricNo },
                {
                    $set: {
                        fullName: stu.fullName,
                        email: stu.email,
                        password: hashedPassword,
                        matricNo: stu.matricNo,
                        department: department._id,
                    }
                },
                { upsert: true }
            )
        };
        console.log("🌱 Students seeded✅");

        for (const adm of adminsData) {
            const hashedPassword = await bcrypt.hash(adm.password, 10);

            await Admin.updateOne(
                { adminId: adm.adminId },
                {
                    $set: {
                        fullName: adm.fullName,
                        password: hashedPassword,
                        adminId: adm.adminId,
                    }
                },
                { upsert: true }
            );
        }
        console.log("🌱 Admins seeded✅");

        for (const course of coursesData) {
            const department = await Department.findOne({
                name: course.department,
            });

            if (!department) continue;

            await Course.updateOne(
                { courseCode: course.courseCode },
                {
                    $set: {
                        courseTitle: course.courseTitle,
                        creditUnit: course.creditUnit,
                        semester: course.semester,
                        level: course.level,
                        department: department._id,
                    },
                },
                { upsert: true }
            );
        }
        console.log("🌱 Courses seeded✅");
        console.log("🌱 Database seeded successfully ✅");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
