const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    totalBeds: { type: Number, required: true },
    icuBeds: { type: Number, required: true },
    departments: [{ type: String }],
    contact: {
        phone: String,
        email: String
    }
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

// Sample Hospital Data for Mumbai
const sampleHospitals = [
    {
        name: "KEM Hospital",
        city: "Mumbai",
        location: "Parel, Mumbai",
        totalBeds: 1800,
        icuBeds: 150,
        departments: ["Emergency", "ICU", "Cardiology", "Neurology", "Pediatrics"],
        contact: {
            phone: "+91-22-24107000",
            email: "kem@hospital.gov.in"
        }
    },
    {
        name: "Sion Hospital",
        city: "Mumbai",
        location: "Sion, Mumbai",
        totalBeds: 1500,
        icuBeds: 120,
        departments: ["Emergency", "ICU", "Orthopedics", "General Medicine"],
        contact: {
            phone: "+91-22-24076621",
            email: "sion@hospital.gov.in"
        }
    },
    {
        name: "Nair Hospital",
        city: "Mumbai",
        location: "Mumbai Central",
        totalBeds: 1400,
        icuBeds: 110,
        departments: ["Emergency", "ICU", "Surgery", "ENT", "Ophthalmology"],
        contact: {
            phone: "+91-22-23027643",
            email: "nair@hospital.gov.in"
        }
    },
    {
        name: "Lilavati Hospital",
        city: "Mumbai",
        location: "Bandra West, Mumbai",
        totalBeds: 320,
        icuBeds: 85,
        departments: ["Emergency", "ICU", "Cardiology", "Oncology", "Nephrology"],
        contact: {
            phone: "+91-22-26562222",
            email: "info@lilavatihospital.com"
        }
    },
    {
        name: "Jaslok Hospital",
        city: "Mumbai",
        location: "Pedder Road, Mumbai",
        totalBeds: 350,
        icuBeds: 90,
        departments: ["Emergency", "ICU", "Neurosurgery", "Gastroenterology"],
        contact: {
            phone: "+91-22-66573333",
            email: "jaslok@jaslokhospital.net"
        }
    },
    {
        name: "Hinduja Hospital",
        city: "Mumbai",
        location: "Mahim, Mumbai",
        totalBeds: 450,
        icuBeds: 100,
        departments: ["Emergency", "ICU", "Cardiac Surgery", "Pulmonology"],
        contact: {
            phone: "+91-22-24447000",
            email: "info@hindujahospital.com"
        }
    },
    {
        name: "Breach Candy Hospital",
        city: "Mumbai",
        location: "Breach Candy, Mumbai",
        totalBeds: 200,
        icuBeds: 55,
        departments: ["Emergency", "ICU", "Maternity", "Pediatrics"],
        contact: {
            phone: "+91-22-23667788",
            email: "bch@breachcandyhospital.org"
        }
    },
    {
        name: "Kokilaben Dhirubhai Ambani Hospital",
        city: "Mumbai",
        location: "Andheri West, Mumbai",
        totalBeds: 750,
        icuBeds: 180,
        departments: ["Emergency", "ICU", "Oncology", "Robotics Surgery", "Transplant"],
        contact: {
            phone: "+91-22-66206666",
            email: "info@relianceada.com"
        }
    },
    {
        name: "Fortis Hospital",
        city: "Mumbai",
        location: "Mulund, Mumbai",
        totalBeds: 315,
        icuBeds: 78,
        departments: ["Emergency", "ICU", "Orthopedics", "Bariatric Surgery"],
        contact: {
            phone: "+91-22-67603636",
            email: "fortis@fortishealthcare.com"
        }
    },
    {
        name: "Tata Memorial Hospital",
        city: "Mumbai",
        location: "Parel, Mumbai",
        totalBeds: 629,
        icuBeds: 95,
        departments: ["Oncology", "Radiation", "Surgical Oncology", "ICU"],
        contact: {
            phone: "+91-22-24177000",
            email: "tmc@tmc.gov.in"
        }
    },
    {
        name: "Wockhardt Hospital",
        city: "Mumbai",
        location: "Mira Road, Mumbai",
        totalBeds: 350,
        icuBeds: 85,
        departments: ["Emergency", "ICU", "Cardiology", "Neurology"],
        contact: {
            phone: "+91-22-66251000",
            email: "wockhardt@wockhardthospitals.com"
        }
    },
    {
        name: "Holy Family Hospital",
        city: "Mumbai",
        location: "Bandra West, Mumbai",
        totalBeds: 280,
        icuBeds: 65,
        departments: ["Emergency", "Maternity", "Pediatrics", "ICU"],
        contact: {
            phone: "+91-22-26432222",
            email: "hfh@holyfamilyhospital.com"
        }
    }
];

async function seedHospitals() {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mumbai_hacks';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        // Clear existing hospitals
        console.log('Clearing existing hospitals...');
        await Hospital.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert new hospitals
        console.log('Inserting sample hospitals...');
        const inserted = await Hospital.insertMany(sampleHospitals);
        console.log(`✅ Successfully inserted ${inserted.length} hospitals`);

        // Display inserted hospitals
        console.log('\n📊 Inserted Hospitals:');
        inserted.forEach((hospital, index) => {
            console.log(`${index + 1}. ${hospital.name} - ${hospital.location}`);
            console.log(`   Total Beds: ${hospital.totalBeds}, ICU: ${hospital.icuBeds}`);
        });

        console.log('\n✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedHospitals();
