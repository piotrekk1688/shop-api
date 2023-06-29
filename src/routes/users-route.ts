import { Router } from "express";
import { UserController } from "../controllers/user-controller";
import { isAdmin } from '../middlewares/is-admin';

const usersRouter = Router();
const userController = new UserController();

usersRouter.get('/', userController.getAllUsers);
usersRouter.get('/:id', userController.getUserById);
usersRouter.get('/login/:email', userController.loginUser);
usersRouter.post('/', userController.createUser);
usersRouter.delete('/:id', isAdmin, userController.removeUser);

export default usersRouter;