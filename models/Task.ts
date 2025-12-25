import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    userId: { type: String, required: true },
    description: string;
    status: 'PENDING' | 'COMPLETED';
    createdAt: Date;
    completedAt?: Date;
}

const TaskSchema: Schema = new Schema({
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
