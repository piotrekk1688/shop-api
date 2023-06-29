import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, requierd: true },
    price: { type: Number, requierd: true }
});

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);