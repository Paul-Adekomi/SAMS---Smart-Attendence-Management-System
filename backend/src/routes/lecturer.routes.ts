import { Router } from "express";
import { loginLecturer } from "../controllers/lecturer.auth.controller";

const router = Router();

router.post('/login', loginLecturer);

export default router