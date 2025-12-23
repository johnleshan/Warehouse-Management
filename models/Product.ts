import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    sku: string;
    category: string;
    price: number;
    quantity: number;
    minStock: number;
    supplier?: string;
}

const ProductSchema: Schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 10 },
    supplier: { type: String },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
