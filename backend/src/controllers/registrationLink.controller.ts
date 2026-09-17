import { Request, Response } from "express";
import crypto from "crypto";
import { RegistrationLink } from "../models/registrationLink.model";
import { Department } from "../models/department.model";

export interface AuthRequest extends Request {
    user?: any;
}

const getStatus = (link: { isRevoked: boolean; expiresAt: Date }) => {
    if (link.isRevoked) return "revoked";
    if (new Date(link.expiresAt) < new Date()) return "expired";
    return "active";
};

// ─── ADMIN: generate a new registration link ───────────────
export const generateRegistrationLink = async (req: AuthRequest, res: Response) => {
    try {
        const { departmentId, expiresInHours } = req.body;

        if (!departmentId || !expiresInHours) {
            return res.status(400).json({ message: "departmentId and expiresInHours are required" });
        }

        const hours = Number(expiresInHours);
        if (!hours || hours <= 0) {
            return res.status(400).json({ message: "expiresInHours must be a positive number" });
        }

        const department = await Department.findById(departmentId);
        if (!department) return res.status(404).json({ message: "Department not found" });

        const token = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        const link = await RegistrationLink.create({
            token,
            department: department._id,
            expiresAt,
            createdBy: req.user.id,
        });

        return res.status(201).json({
            message: "Registration link generated",
            link: { ...link.toObject(), department, status: "active" },
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// ─── ADMIN: view all registration links (active + past) ────
export const listRegistrationLinks = async (_req: AuthRequest, res: Response) => {
    try {
        const links = await RegistrationLink.find()
            .populate("department")
            .sort({ createdAt: -1 });

        const data = links.map((link: any) => ({
            ...link.toObject(),
            status: getStatus(link),
        }));

        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// ─── ADMIN: revoke an active link ───────────────────────────
export const revokeRegistrationLink = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const link = await RegistrationLink.findById(id);
        if (!link) return res.status(404).json({ message: "Registration link not found" });

        link.isRevoked = true;
        await link.save();

        return res.json({ message: "Registration link revoked", link });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// ─── PUBLIC: validate a token before showing the registration form ───
export const validateRegistrationLink = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const link = await RegistrationLink.findOne({ token }).populate("department");
        if (!link) return res.status(404).json({ message: "This registration link is invalid." });
        if (link.isRevoked) return res.status(410).json({ message: "This registration link has been disabled by the admin." });
        if (new Date(link.expiresAt) < new Date()) return res.status(410).json({ message: "This registration link has expired." });

        return res.json({
            valid: true,
            department: link.department,
            expiresAt: link.expiresAt,
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
