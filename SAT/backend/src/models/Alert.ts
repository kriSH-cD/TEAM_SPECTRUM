import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    hospitalId?: string;
    read: boolean;
    createdAt: Date;
}

const AlertSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'danger', 'success'], required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAlert>('Alert', AlertSchema);
