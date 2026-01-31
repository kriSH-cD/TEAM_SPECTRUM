const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['public', 'hospital_staff', 'pharmacy', 'admin'], default: 'public' },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

const users = [
    {
        name: 'System Administrator',
        email: 'admin@medicast.com',
        password: 'password123',
        role: 'admin'
    },
    {
        name: 'Hospital Staff',
        email: 'hospital@medicast.com',
        password: 'password123',
        role: 'hospital_staff'
    },
    {
        name: 'Pharmacy Staff',
        email: 'pharmacy@medicast.com',
        password: 'password123',
        role: 'pharmacy'
    },
    {
        name: 'Public User',
        email: 'public@medicast.com',
        password: 'password123',
        role: 'public'
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        for (const user of users) {
            const userExists = await User.findOne({ email: user.email });

            if (userExists) {
                console.log(`User ${user.email} already exists`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await User.create({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
            });

            console.log(`User created: ${user.email}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedUsers();
