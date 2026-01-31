
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const PatientSchema = new mongoose.Schema({
    name: String,
    status: String,
    currentVitals: Object,
    riskScore: Number
}, { timestamps: true });

const Patient = mongoose.model('Patient', PatientSchema);

async function checkPatient() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const patient = await Patient.findOne({ name: { $regex: 'Siddhant', $options: 'i' } });

        if (patient) {
            console.log("✅ Found Patient:", patient);
        } else {
            console.log("❌ Patient 'Siddhant' NOT found via regex search.");
        }

        const allPatients = await Patient.find({}, 'name status');
        console.log(`Total Patients: ${allPatients.length}`);
        // console.log("List:", allPatients.map(p => p.name).join(", "));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkPatient();
