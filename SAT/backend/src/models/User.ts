import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'public' | 'hospital_staff' | 'pharmacy' | 'admin';
    hospitalId?: string;
    pharmacyId?: string;
    phone?: string;
    preferences?: {
        email: boolean;
        sms: boolean;
        whatsapp: boolean;
    };
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['public', 'hospital_staff', 'pharmacy', 'admin'], default: 'public' },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    pharmacyId: { type: String }, // Placeholder for pharmacy ID/Code linkage
    phone: { type: String },
    preferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
