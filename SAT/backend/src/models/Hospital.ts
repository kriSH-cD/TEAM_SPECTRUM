import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
    name: string;
    city: string;
    location: string;
    totalBeds: number;
    icuBeds: number;
    departments: string[];
    createdAt: Date;
}

const HospitalSchema: Schema = new Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    totalBeds: { type: Number, required: true },
    icuBeds: { type: Number, required: true },
    departments: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
