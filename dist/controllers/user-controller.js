"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_1 = require("../models/user");
const hash_password_1 = require("../utils/hash-password");
const compare_passwords_1 = require("../utils/compare-passwords");
class UserController {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_1.UserModel.find().select("-password -_id");
                res.json(users);
            }
            catch (error) {
                console.error("Failed to get users", error);
                res.status(500).json({ error: error.message });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const user = yield user_1.UserModel.findById(id).select("-password -_id");
                if (!user) {
                    res.status(404).json({ error: "User not found" });
                }
                else {
                    res.status(201).json(user);
                }
            }
            catch (error) {
                console.error(`Failed to get user with id ${id}`, error);
                res.status(500).json({ error: error.message });
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({ error: "Invalid request" });
                return;
            }
            const hashedPassword = yield (0, hash_password_1.hashPassword)(password);
            const user = new user_1.UserModel({ _id: email, name, email, password: hashedPassword, isAdmin: false });
            try {
                const savedUser = yield user.save();
                delete savedUser.password;
                delete savedUser._id;
                res.status(201).json(savedUser);
            }
            catch (error) {
                console.error("Failed to save user", error);
                res.status(500).json({ error: error.message });
            }
        });
    }
    removeUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const deletedUser = yield user_1.UserModel.findByIdAndDelete(id);
                if (!deletedUser) {
                    res.status(404).json({ error: "User not found" });
                }
                else {
                    res.json({ message: "User deleted successfully" });
                }
            }
            catch (error) {
                console.error(`Failed to delete user with id ${id}`, error);
                res.status(500).json({ error: error.message });
            }
        });
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: "Invalid request" });
                return;
            }
            try {
                const user = yield user_1.UserModel.findById(email);
                if (!user) {
                    res.status(404).json({ error: "User not found" });
                }
                else {
                    const comparedPasswords = yield (0, compare_passwords_1.comparePasswords)(password, user.password);
                    if (comparedPasswords) {
                        const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
                        res.json(userWithoutPassword);
                    }
                    else {
                        res.json({ message: "Password is incorrect" });
                    }
                }
            }
            catch (error) {
                console.error("Failed to login user", error);
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
