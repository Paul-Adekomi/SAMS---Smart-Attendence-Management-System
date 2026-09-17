import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model";
import { RegistrationLink } from "../models/registrationLink.model";


const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};


// STUDENT LOGIN

export const loginStudent = async (req: Request, res: Response) => {
    try {
        const {matricNo, password} = req.body;

         if(!matricNo || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        
        const student = await Student.findOne({matricNo});

        if (!student) {
            return res.status(400).json({message: 'Invalid credentials or student does not exists'});
        }

        if (student.isActive === false) {
            return res.status(403).json({message: 'This account has been deactivated. Contact your administrator.'});
        }

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            return res.status(400).json({message: 'Incorrect password'});
        }

        const token = generateToken(student._id.toString(), student.role);

        return res.status(201).json({
            message: 'Login successful',
            token,
            student
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error', error});
    }
}

// STUDENT SELF-REGISTRATION (via an admin-generated registration link)

export const registerStudent = async (req: Request, res: Response) => {
    try {
        const { token, fullName, email, matricNo, password } = req.body;

        if (!token || !fullName || !email || !matricNo || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const link = await RegistrationLink.findOne({ token });
        if (!link) return res.status(404).json({ message: 'This registration link is invalid.' });
        if (link.isRevoked) return res.status(410).json({ message: 'This registration link has been disabled by the admin.' });
        if (new Date(link.expiresAt) < new Date()) return res.status(410).json({ message: 'This registration link has expired.' });

        const existing = await Student.findOne({ $or: [{ email }, { matricNo }] });
        if (existing) {
            return res.status(400).json({ message: 'A student with this email or matric number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            fullName,
            email,
            matricNo,
            password: hashedPassword,
            department: link.department,
        });

        const authToken = generateToken(student._id.toString(), student.role);

        return res.status(201).json({
            message: 'Registration successful',
            token: authToken,
            student: { ...student.toObject(), password: undefined },
        });
    } catch (error: any) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
