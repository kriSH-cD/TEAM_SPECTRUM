import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
    hospitalId: string;
    date: Date;
    type: 'beds' | 'icu' | 'staff' | 'medicine';
    currentValue: number;
    predictedValue: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    createdAt: Date;
}

const PredictionSchema: Schema = new Schema({
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['beds', 'icu', 'staff', 'medicine'], required: true },
    currentValue: { type: Number, required: true },
    predictedValue: { type: Number, required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    factors: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPrediction>('Prediction', PredictionSchema);
