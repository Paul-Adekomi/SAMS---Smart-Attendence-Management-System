import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const authorize = (role: "student" | "admin") => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role !== role) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    }
}
