import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    type: 'IN' | 'OUT';
    productId: string;
    quantity: number;
    date: Date;
    notes?: string;
    performedBy?: string;
}

const TransactionSchema: Schema = new Schema({
    _id: { type: String, required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    performedBy: { type: String },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
