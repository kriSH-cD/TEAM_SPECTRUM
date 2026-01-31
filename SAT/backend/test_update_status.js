
const axios = require('axios');

async function testUpdate() {
    try {
        // 1. Get a patient ID
        console.log("Fetching patients...");
        const res = await axios.get('http://localhost:5001/api/patients');
        const patients = res.data;
        if (patients.length === 0) {
            console.log("No patients found.");
            return;
        }

        const targetPatient = patients[0];
        console.log(`Target Patient: ${targetPatient.name} (ID: ${targetPatient._id})`);
        console.log(`Current Status: ${targetPatient.status}`);

        // 2. Update Status to ICU
        const newStatus = targetPatient.status === 'ICU' ? 'WARD' : 'ICU';
        console.log(`Attempting to update status to: ${newStatus}`);

        const updateRes = await axios.put(`http://localhost:5001/api/patients/${targetPatient._id}`, {
            ...targetPatient, // This mimics what the frontend does (sending the whole object back)
            status: newStatus
        });

        console.log("Update Response Status:", updateRes.status);
        console.log("Updated Patient Status in Response:", updateRes.data.patient.status);

        // 3. Verify Fetch
        const verifyRes = await axios.get(`http://localhost:5001/api/patients`);
        const verifiedPatient = verifyRes.data.find(p => p._id === targetPatient._id);
        console.log(`Verified Status in DB: ${verifiedPatient.status}`);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

testUpdate();
