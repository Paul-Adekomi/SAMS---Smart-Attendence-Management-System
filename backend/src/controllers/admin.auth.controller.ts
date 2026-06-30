import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// Admin Login

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { adminId, password } = req.body;

        if (!adminId || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const admin = await Admin.findOne({ adminId });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin._id.toString(), admin.role);

        return res.status(201).json({
            message: 'Login successful',
            token,
            admin
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};
