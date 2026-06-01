import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model";


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