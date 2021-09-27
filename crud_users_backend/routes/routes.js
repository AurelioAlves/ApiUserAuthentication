import express from "express"
import UserController from "../controllers/UserController.js";
import Auth from "../middleware/Auth.js";

const app = express();
const router = express.Router();

router.post('/user', UserController.create);
router.get('/user', Auth, UserController.index);
router.get('/user/:id', UserController.findUser);
router.put("/user", UserController.edit);
router.delete("/user/:id", Auth, UserController.remove);
router.post("/login", UserController.login);

export default router