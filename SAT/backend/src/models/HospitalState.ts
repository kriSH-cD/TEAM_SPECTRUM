import mongoose, { Schema, Document } from 'mongoose';

export interface IHospitalState extends Document {
    department: string; // e.g., "General Hospital"

    // Resource Counts
    icuBedsTotal: number;
    icuBedsOccupied: number;

    wardBedsTotal: number;
    wardBedsOccupied: number;

    erBedsTotal: number;
    erBedsOccupied: number;

    // Staffing
    nursesActive: number;
    doctorsActive: number;
    staffLoad: number; // 0-100% (calculated)

    lastUpdated: Date;
}

const HospitalStateSchema: Schema = new Schema({
    department: { type: String, required: true, default: "General Hospital" },

    icuBedsTotal: { type: Number, default: 20 },
    icuBedsOccupied: { type: Number, default: 0 },

    wardBedsTotal: { type: Number, default: 100 },
    wardBedsOccupied: { type: Number, default: 0 },

    erBedsTotal: { type: Number, default: 30 },
    erBedsOccupied: { type: Number, default: 0 },

    nursesActive: { type: Number, default: 50 },
    doctorsActive: { type: Number, default: 20 },
    staffLoad: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IHospitalState>('HospitalState', HospitalStateSchema);
