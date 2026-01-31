import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { uploadProfilePicture } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authuorization.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login",authController.login);
router.get("/profile", authorizedMiddleware, authController.getProfile.bind(authController));
router.put("/update-profile", authorizedMiddleware, uploadProfilePicture.single("profilePicture"), authController.updateProfile);

export default router;