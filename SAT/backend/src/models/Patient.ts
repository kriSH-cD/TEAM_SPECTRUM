import mongoose, { Schema, Document } from 'mongoose';

export interface IVitals {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spO2: number;
  temperature: number;
  respiratoryRate: number;
  timestamp: Date;
}

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  admissionTime: Date;
  status: 'WAITING' | 'ER' | 'ICU' | 'WARD' | 'DISCHARGED';
  
  // Dynamic Agent Data
  currentVitals: IVitals;
  riskScore: number; // 0-100
  acuityTrend: 'STABLE' | 'IMPROVING' | 'DETERIORATING';
  
  // History for time-series analysis
  vitalsHistory: IVitals[];
  actionsHistory: {
    timestamp: Date;
    action: string; // e.g., "ESCALATE_ICU"
    reason: string;
    agent: string; // "Orchestrator"
  }[];
}

const PatientSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  chiefComplaint: { type: String, required: true },
  admissionTime: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['WAITING', 'ER', 'ICU', 'WARD', 'DISCHARGED'], 
    default: 'WAITING' 
  },
  
  currentVitals: {
    heartRate: Number,
    bpSystolic: Number,
    bpDiastolic: Number,
    spO2: Number,
    temperature: Number,
    respiratoryRate: Number,
    timestamp: { type: Date, default: Date.now }
  },
  
  riskScore: { type: Number, default: 0 },
  acuityTrend: { 
    type: String, 
    enum: ['STABLE', 'IMPROVING', 'DETERIORATING'], 
    default: 'STABLE' 
  },
  
  vitalsHistory: [{
    heartRate: Number,
    bpSystolic: Number,
    bpDiastolic: Number,
    spO2: Number,
    temperature: Number,
    respiratoryRate: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  actionsHistory: [{
    timestamp: { type: Date, default: Date.now },
    action: String,
    reason: String,
    agent: String
  }]
}, { timestamps: true });

export default mongoose.model<IPatient>('Patient', PatientSchema);
