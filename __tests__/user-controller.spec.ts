import { Request, Response } from "express";
import { UserController } from "../src/controllers/user-controller";
import { UserModel } from "../src/models/user";
import { hashPassword } from "../src/utils/hash-password";
import { comparePasswords } from "../src/utils/compare-passwords";

jest.mock("../src/models/user");
jest.mock("../src/utils/hash-password");

describe("UserController", () => {
  let userController!: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    userController = new UserController();
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return all users without passwords and IDs", async () => {
      const fakeUsers = [
        { name: "John Doe", email: "john.doe@example.com", isAdmin: false },
        { name: "Jane Smith", email: "jane.smith@example.com", isAdmin: false },
      ];

      UserModel.find = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(fakeUsers)
      });

      await userController.getAllUsers(req as Request, res as Response);

      expect(UserModel.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([
        { name: "John Doe", email: "john.doe@example.com", isAdmin: false },
        { name: "Jane Smith", email: "jane.smith@example.com", isAdmin: false },
      ]);
    });

    it("should handle errors and return a 500 status code", async () => {
      const error = new Error("Database error");
      UserModel.find = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockRejectedValueOnce(error)
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await userController.getAllUsers(req as Request, res as Response);

      expect(UserModel.find).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(`Failed to get users`, error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getUserById", () => {
    it("should return the user with the given ID", async () => {
      const id = "john@example.com";
      const user = { name: "John Doe", email: "john@example.com", password: "password1", _id: id };

      UserModel.findById = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(user),
      });

      req.params = { id };
      await userController.getUserById(req as Request, res as Response);

      expect(UserModel.findById).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return a 404 status code if the user is not found", async () => {
      UserModel.findById = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce(null),
      });
      req.params = { id: "1" };

      await userController.getUserById(req as Request, res as Response);

      expect(UserModel.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors and return a 500 status code", async () => {
      const id = "1";
      const error = new Error("Database error");
      UserModel.findById = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockRejectedValueOnce(error)
      });
      req.params = { id };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await userController.getUserById(req as Request, res as Response);

      expect(UserModel.findById).toHaveBeenCalledWith(id);
      expect(console.error).toHaveBeenCalledWith(`Failed to get user with id ${id}`, error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("createUser", () => {
    beforeEach(() => {
      req.body = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      };
    });

    it("should create a new user and return it without password and ID", async () => {
      const hashedPassword = "hashedPassword123";
      const savedUser = {
        _id: req.body.email,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isAdmin: false,
      };
      const savedUserWithoutPassword = {
        name: req.body.name,
        email: req.body.email,
        isAdmin: false,
      };

      jest.spyOn(UserModel.prototype, "save").mockResolvedValueOnce(savedUser);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      await userController.createUser(req as Request, res as Response);

      expect(hashPassword).toHaveBeenCalledWith(req.body.password);
      expect(UserModel).toHaveBeenCalledWith({
        _id: req.body.email,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isAdmin: false,
      });
      expect(UserModel.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedUserWithoutPassword);
    });

    it("should handle invalid requests and return a 400 status code", async () => {
      req.body = {
        name: "John Doe",
        password: "password123",
      };

      await userController.createUser(req as Request, res as Response);

      expect(UserModel).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid request" });
    });

    it("should handle errors and return a 500 status code", async () => {
      const error = new Error("Database error");
      const hashedPassword = "hashedPassword123";

      jest.spyOn(UserModel.prototype, "save").mockRejectedValue(error);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await userController.createUser(req as Request, res as Response);

      expect(hashPassword).toHaveBeenCalledWith("password123");
      expect(UserModel).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Failed to save user", error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("removeUser", () => {
    it("should remove the user with the given ID", async () => {
      const id = "user1@example.com1";
      const deletedUser = { _id: id, name: "User 1", email: "user1@example.com", password: "password1" };

      req.params = { id };
      UserModel.findByIdAndDelete = jest.fn().mockResolvedValueOnce(deletedUser);
      
      await userController.removeUser(req as Request, res as Response);

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    // it("should return a 404 status code if the user is not found", async () => {
    //   UserModel.findByIdAndDelete.mockResolvedValueOnce(null);

    //   req.params = { id: "1" };
    //   await userController.removeUser(req as Request, res as Response);

    //   expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("1");
    //   expect(res.status).toHaveBeenCalledWith(404);
    //   expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    // });

    // it("should handle errors and return a 500 status code", async () => {
    //   const id = "1";
    //   const error = new Error("Database error");
    //   UserModel.findByIdAndDelete.mockRejectedValueOnce(error);

    //   req.params = { id };
    //   await userController.removeUser(req as Request, res as Response);

    //   expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    //   expect(console.error).toHaveBeenCalledWith(`Failed to delete user with id ${id}`, error);
    //   expect(res.status).toHaveBeenCalledWith(500);
    //   expect(res.json).toHaveBeenCalledWith({ error: error._message });
    // });
  });

  // describe("loginUser", () => {
  //   beforeEach(() => {
  //     req.body = {
  //       email: "john.doe@example.com",
  //       password: "password123",
  //     };
  //   });

  //   it("should return the user without password if the login is successful", async () => {
  //     const user = {
  //       _id: "1",
  //       name: "John Doe",
  //       email: "john.doe@example.com",
  //       password: "hashedPassword123",
  //     };
  //     const userWithoutPassword = {
  //       _id: "1",
  //       name: "John Doe",
  //       email: "john.doe@example.com",
  //     };
  //     UserModel.findById.mockResolvedValueOnce(user);
  //     comparePasswords.mockResolvedValueOnce(true);

  //     await userController.loginUser(req as Request, res as Response);

  //     expect(UserModel.findById).toHaveBeenCalledWith("john.doe@example.com");
  //     expect(comparePasswords).toHaveBeenCalledWith("password123", "hashedPassword123");
  //     expect(res.json).toHaveBeenCalledWith(userWithoutPassword);
  //   });

  //   it("should return a 404 status code if the user is not found", async () => {
  //     UserModel.findById.mockResolvedValueOnce(null);

  //     await userController.loginUser(req as Request, res as Response);

  //     expect(UserModel.findById).toHaveBeenCalledWith("john.doe@example.com");
  //     expect(res.status).toHaveBeenCalledWith(404);
  //     expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  //   });

  //   it("should return a message if the password is incorrect", async () => {
  //     const user = {
  //       _id: "1",
  //       name: "John Doe",
  //       email: "john.doe@example.com",
  //       password: "hashedPassword123",
  //     };
  //     UserModel.findById.mockResolvedValueOnce(user);
  //     comparePasswords.mockResolvedValueOnce(false);

  //     await userController.loginUser(req as Request, res as Response);

  //     expect(UserModel.findById).toHaveBeenCalledWith("john.doe@example.com");
  //     expect(comparePasswords).toHaveBeenCalledWith("password123", "hashedPassword123");
  //     expect(res.json).toHaveBeenCalledWith({ message: "Password is incorrect" });
  //   });

  //   it("should handle invalid requests and return a 400 status code", async () => {
  //     req.body = {
  //       password: "password123",
  //     };

  //     await userController.loginUser(req as Request, res as Response);

  //     expect(UserModel.findById).not.toHaveBeenCalled();
  //     expect(comparePasswords).not.toHaveBeenCalled();
  //     expect(res.status).toHaveBeenCalledWith(400);
  //     expect(res.json).toHaveBeenCalledWith({ error: "Invalid request" });
  //   });

  //   it("should handle errors and return a 500 status code", async () => {
  //     const error = new Error("Database error");
  //     UserModel.findById.mockRejectedValueOnce(error);

  //     await userController.loginUser(req as Request, res as Response);

  //     expect(UserModel.findById).toHaveBeenCalledWith("john.doe@example.com");
  //     expect(console.error).toHaveBeenCalledWith("Failed to login user", error);
  //     expect(res.status).toHaveBeenCalledWith(500);
  //     expect(res.json).toHaveBeenCalledWith({ error: error._message });
  //   });
  // });
});


