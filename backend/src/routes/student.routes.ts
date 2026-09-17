import { Router } from "express";
import { loginStudent, registerStudent } from "../controllers/student.auth.controller";

const router = Router();

router.post('/login', loginStudent);
router.post('/register', registerStudent);

export default router;
