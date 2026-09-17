import { Router } from "express";
import { validateRegistrationLink } from "../controllers/registrationLink.controller";

const router = Router();

// Public: lets the student registration page check a link before showing the form
router.get("/registration-links/:token", validateRegistrationLink);

export default router;
