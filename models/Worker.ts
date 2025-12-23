import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
    name: string;
    role: string;
    joinedAt: Date;
}

const WorkerSchema: Schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Worker || mongoose.model<IWorker>('Worker', WorkerSchema);
