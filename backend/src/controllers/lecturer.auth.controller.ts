import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Lecturer } from '../models/lecturer.model';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};


// Lecturer Login

export const loginLecturer = async (req: Request, res: Response) => {
    try{
        const {lecturerId, password} = req.body;

         if(!lecturerId || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        const lecturer = await Lecturer.findOne({lecturerId});
        
        if(!lecturer){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, lecturer.password);

        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const token = generateToken(lecturer._id.toString(), lecturer.role);

        return res.status(201).json({
            message: 'Login successful',
            token,
            lecturer
        });
    }catch(error){
        return res.status(500).json({message: 'Server error', error});
    }
}