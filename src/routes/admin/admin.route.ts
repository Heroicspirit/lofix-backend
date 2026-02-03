import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authuorization.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { upload } from "../../middlewares/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware

router.post("/", upload.single("profilePicture"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", upload.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;