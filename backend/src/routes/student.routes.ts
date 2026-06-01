import { Router } from "express";
import { loginStudent } from "../controllers/student.auth.controller";

const router = Router();

router.post('/login', loginStudent);

export default router;