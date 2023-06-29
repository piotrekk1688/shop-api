import { Request, Response } from "express";
import { UserModel } from "../models/user";
import { hashPassword } from "../utils/hash-password";
import { comparePasswords } from "../utils/compare-passwords";

export class UserController {
  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.find().select("-password -_id");
      res.json(users);
    } catch (error: any) {
      console.error("Failed to get users", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    try {
      const user = await UserModel.findById(id).select("-password -_id");

      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(201).json(user);
      }
    } catch (error: any) {
      console.error(`Failed to get user with id ${id}`, error);
      res.status(500).json({ error: error.message });
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = new UserModel({ _id: email, name, email, password: hashedPassword, isAdmin: false });

    try {
      const savedUser: any = await user.save();
      delete savedUser.password;
      delete savedUser._id;

      res.status(201).json(savedUser);
    } catch (error: any) {
      console.error("Failed to save user", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async removeUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    try {
      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (!deletedUser) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json({ message: "User deleted successfully" });
      }
    } catch (error: any) {
      console.error(`Failed to delete user with id ${id}`, error);
      res.status(500).json({ error: error.message });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    try {
      const user = await UserModel.findById(email);

      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        const comparedPasswords = await comparePasswords(password, user.password);

        if (comparedPasswords) {
          const { password, ...userWithoutPassword } = user.toObject();

          res.json(userWithoutPassword);
        } else {
          res.json({ message: "Password is incorrect" });
        }
      }
    } catch (error: any) {
      console.error("Failed to login user", error);
      res.status(500).json({ error: error.message });
    }
  }
}
