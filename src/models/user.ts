import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

const UserSchema: Schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, requierd: true },
    email: {
        type: String,
        requierd: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'No valid email address']
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean },
}, { _id: false });

export const UserModel = mongoose.model<IUser>('User', UserSchema);