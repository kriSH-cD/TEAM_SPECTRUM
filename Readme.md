# 🏥 SAT - AI-Powered Healthcare Forecasting & Triage Platform

> An intelligent healthcare management system that uses AI agents to predict patient admissions, optimize resource allocation, and assist with real-time triage decisions.

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-18.x-green)]()
[![Python](https://img.shields.io/badge/python-3.11-blue)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Complete Workflow](#complete-workflow)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🎯 Overview

**SAT** is a comprehensive healthcare platform that combines predictive analytics, AI-powered triage, and real-time resource management to help hospitals optimize patient care and resource allocation.

### What It Does

- **Predicts** hospital admissions 14 days in advance
- **Triages** patients using AI agents with real-time decision support
- **Optimizes** ICU/ward bed allocation based on patient risk scores
- **Assists** healthcare staff with an intelligent AI chatbot
- **Monitors** hospital resources and generates alerts
- **Forecasts** oxygen demand, staffing needs, and capacity requirements

---

## ✨ Key Features

### 🤖 AI Agent Control Room
- Real-time patient triage with AI-powered decision making
- Automatic patient status assignment (WAITING, ER, ICU, WARD)
- Risk score calculation based on vital signs
- Intelligent resource allocation recommendations
- Live simulation of patient condition changes

### 💬 AI Chatbot Assistant
- Context-aware responses about hospital status
- Natural language queries about patients and resources
- Real-time data integration (ICU occupancy, patient counts)
- Powered by GROQ API with LLaMA models

### 📊 Predictive Analytics
- 14-day admission forecasting using ensemble models
- ICU demand prediction
- Oxygen consumption forecasting
- Staff requirement estimation
- Confidence intervals for all predictions

### 🏥 Hospital Dashboard
- Real-time resource monitoring
- Critical action items and alerts
- Capacity utilization metrics
- Multi-hospital network view

### 🔐 Role-Based Access Control
- Public users (view forecasts)
- Hospital staff (full access)
- Pharmacy (medication management)
- Admin (system configuration)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│                     Port 5173 (Vite Dev)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Landing    │  │  Dashboard   │  │Agent Control │       │
│  │     Page     │  │    Pages     │  │     Room     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────┼─────────────────────────────────┐
│                  Backend (Node.js/Express)                  │
│                        Port 5001                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │ Patients │  │Hospitals │  │  Alerts  │     │
│  │Controller│  │Controller│  │Controller│  │Controller│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
┌───────────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐
│   MongoDB        │ │ AI Service │ │  External APIs │
│   Port 27017     │ │ Port 5002  │ │  (GROQ, HF)    │
│                  │ │            │ │                │
│ ┌──────────────┐ │ │ ┌────────┐ │ │                │
│ │   Patients   │ │ │ │  Chat  │ │ │                │
│ │   Hospitals  │ │ │ │Forecast│ │ │                │
│ │     Users    │ │ │ │ Triage │ │ │                │
│ │    Alerts    │ │ │ └────────┘ │ │                │
│ └──────────────┘ │ └────────────┘ │                │
└──────────────────┘                └────────────────┘
```

---

## 🔄 Complete Workflow

### 1️⃣ **User Authentication Flow**

```
User → Landing Page → Sign Up/Login
  ↓
Backend validates credentials
  ↓
JWT token generated
  ↓
User redirected to role-specific dashboard
  ↓
Token stored in localStorage for subsequent requests
```

**Code Path:**
- Frontend: `src/pages/Login.tsx`, `src/pages/Signup.tsx`
- Backend: `src/controllers/authController.ts`
- Routes: `src/routes/authRoutes.ts`

---

### 2️⃣ **Patient Admission & Triage Flow**

```
Hospital Staff → Agent Control Room → Click "Admit Patient"
  ↓
Modal opens with patient form
  ↓
Staff enters:
  - Name, Age, Gender
  - Chief Complaint
  - Initial Status (WAITING/ER/ICU/WARD)
  - Vital Signs (HR, SpO2, BP)
  ↓
Frontend sends POST /api/patients/admit
  ↓
Backend creates patient record
  ↓
AI Service evaluates patient (/evaluate_patient)
  ↓
Returns: action, priority_score, reason
  ↓
Patient appears in appropriate column
  ↓
Real-time updates via state management
```

**Code Path:**
- Frontend: `src/pages/AgentControlRoom.tsx` (lines 130-157)
- Backend: `src/controllers/patientController.ts` (admitPatient)
- AI Service: `ai_service.py` (evaluate_patient endpoint)

**Key Functions:**
```typescript
Frontend - AgentControlRoom.tsx
const handleAdmitPatient = async () => {
  await axios.post(`${API_URL}/admit`, {
    name, age, gender, chiefComplaint, status, vitals
  });
  Triggers AI evaluation automatically
}
```

```typescript
Backend - patientController.ts
export const admitPatient = async (req, res) => {
  const newPatient = new Patient({ ...req.body });
  await newPatient.save();
  const decision = await evaluatePatient(newPatient);
  res.json({ patient: newPatient, initialDecision: decision });
}
```

---

### 3️⃣ **AI Chatbot Interaction Flow**

```
User → Clicks floating chat button
  ↓
Chat window opens with welcome message
  ↓
User types question: "How many patients in ICU?"
  ↓
Frontend sends POST http://localhost:5002/chat
  ↓
Payload includes:
  - message: user query
  - role: hospital_staff
  - context: {patients, icuOccupied, icuTotal, ...}
  ↓
AI Service (Flask) receives request
  ↓
GROQ API called with LLaMA model
  ↓
AI generates context-aware response
  ↓
Response sent back to frontend
  ↓
Message displayed in chat window
```

**Code Path:**
- Frontend: `src/pages/AgentControlRoom.tsx` (lines 165-200, 543-643)
- AI Service: `ai_service.py` (chat endpoint)

**Key Functions:**
```typescript
// Frontend - Chat Handler
const handleSendMessage = async () => {
  const response = await axios.post('http://localhost:5002/chat', {
    message: userMessage,
    role: 'hospital_staff',
    context: {
      patients: patients.length,
      icuOccupied: hospitalState.icuBedsOccupied,
      icuTotal: hospitalState.icuBedsTotal
    }
  });
  setChatMessages([...prev, { role: 'assistant', content: response.data.response }]);
}
```

```python
# AI Service - Chat Endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    context = data.get('context', {})
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{message}\nContext: {context}"}
        ]
    )
    return jsonify({"response": response.choices[0].message.content})
```

---

### 4️⃣ **Forecasting & Prediction Flow**

```
User → Forecasts Page
  ↓
Frontend requests GET /api/ai/forecast?days=14
  ↓
Backend forwards to AI Service
  ↓
AI Service runs ensemble models:
  - ARIMA (time series)
  - Prophet (seasonality)
  - LSTM (deep learning)
  ↓
Predictions aggregated with confidence intervals
  ↓
Returns forecast data:
  - Daily admission predictions
  - ICU demand
  - Oxygen requirements
  - Staff needed
  ↓
Frontend renders charts using Recharts
  ↓
User sees 14-day forecast with confidence bands
```

**Code Path:**
- Frontend: `src/pages/Forecasts.tsx`
- Backend: `src/controllers/aiController.ts`
- AI Service: `ai_service.py` (predict/final endpoint)

---

### 5️⃣ **Real-Time Simulation Flow**

```
Staff → Agent Control Room → Click "Next Step"
  ↓
Frontend sends POST /api/patients/simulate
  ↓
Backend processes all active patients:
  ↓
  For each patient:
    1. Randomly fluctuate vital signs
    2. Call AI Service to evaluate new state
    3. Update patient status if needed
    4. Log agent decision
  ↓
Hospital resources updated:
  - ICU bed occupancy
  - Ward bed occupancy
  ↓
Results returned to frontend
  ↓
UI updates with new patient states
  ↓
Activity log shows latest actions
```

**Code Path:**
- Frontend: `src/pages/AgentControlRoom.tsx` (runSimulation)
- Backend: `src/controllers/patientController.ts` (runSimulationStep)

**Key Logic:**
```typescript
// Backend - Simulation Step
export const runSimulationStep = async (req, res) => {
  const patients = await Patient.find({ status: { $ne: 'DISCHARGED' } });
  
  for (const patient of patients) {
    // Fluctuate vitals
    patient.currentVitals.spO2 += Math.random() > 0.5 ? 2 : -2;
    patient.currentVitals.heartRate += Math.random() > 0.5 ? 5 : -5;
    
    // AI evaluation
    const decision = await evaluatePatient(patient);
    
    // Update based on AI decision
    if (decision.action === 'TRANSFER_TO_ICU') {
      patient.status = 'ICU';
    }
    
    await patient.save();
  }
}
```

---

### 6️⃣ **Data Flow Diagram**

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User Action (Click, Type, Submit)
       ▼
┌─────────────┐
│   React     │
│  Component  │ 2. State Update (useState, useEffect)
└──────┬──────┘
       │ 3. API Call (axios.post/get)
       ▼
┌─────────────┐
│   Backend   │
│   Express   │ 4. Route Handler
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   MongoDB   │   │ AI Service  │
│             │   │   (Flask)   │
│ 5. CRUD Ops │   │ 6. ML Model │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 ▼
       │          ┌─────────────┐
       │          │  GROQ API   │
       │          │  (LLaMA)    │
       │          └──────┬──────┘
       │                 │
       └────────┬────────┘
                │ 7. Response
                ▼
         ┌─────────────┐
         │   Frontend  │
         │  UI Update  │ 8. Render
         └─────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Toastify

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Express Validator
- **Security:** bcryptjs, helmet, cors

### AI Service
- **Language:** Python 3.11
- **Framework:** Flask
- **ML Libraries:**
  - PyTorch (deep learning)
  - Transformers (Hugging Face)
  - Prophet (time series)
  - scikit-learn (traditional ML)
- **AI API:** GROQ (LLaMA 3.3)
- **Vector DB:** Qdrant (optional RAG)

### Database
- **Primary:** MongoDB
- **ORM:** Mongoose
- **Collections:** Users, Patients, Hospitals, Alerts, Predictions

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB 6+
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd SAT
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Install AI Service Dependencies
```bash
cd ../ai-model
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Backend Environment Variables

Create `backend/.env`:
```bash
PORT=5001
MONGO_URI=mongodb://localhost:27017/medicast
JWT_SECRET=your_secure_random_secret_here
NODE_ENV=development

# AI API Keys
GROQ_API_KEY=your_groq_api_key_here
HF_TOKEN=your_huggingface_token_here
```

### 2. Frontend Configuration

Update `frontend/src/config.ts` if needed:
```typescript
export const API_URL = 'http://localhost:5001/api';
export const AI_SERVICE_URL = 'http://localhost:5002';
```

### 3. AI Service Configuration

The AI service reads from backend `.env` automatically.

---

## 🚀 Running the Application

### Option 1: Run All Services Separately

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 4 - AI Service:**
```bash
cd ai-model
export GROQ_API_KEY=your_groq_api_key_here
python ai_service.py
```

### Option 2: Use Process Manager (Recommended)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev'
    },
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev'
    },
    {
      name: 'ai-service',
      cwd: './ai-model',
      script: 'python',
      args: 'ai_service.py',
      env: {
        GROQ_API_KEY: 'your_groq_api_key_here'
      }
    }
  ]
};
```

Then run:
```bash
pm2 start ecosystem.config.js
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **AI Service:** http://localhost:5002

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

**Authentication:**
- `POST /api/auth/signup/public` - Register public user
- `POST /api/auth/signup/hospital` - Register hospital staff
- `POST /api/auth/login` - Login

**Patients:**
- `GET /api/patients` - Get all patients
- `POST /api/patients/admit` - Admit new patient
- `POST /api/patients/simulate` - Run simulation step

**AI:**
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/forecast` - Get predictions
- `POST /api/ai/predict` - Get patient risk prediction

**Hospitals:**
- `GET /api/hospitals` - Get all hospitals
- `POST /api/hospitals` - Create hospital (admin)

**Alerts:**
- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/:id/read` - Mark alert as read

---

## 📁 Project Structure

```
SAT/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ResourcePanel.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── AgentControlRoom.tsx
│   │   │   ├── Forecasts.tsx
│   │   │   ├── Hospitals.tsx
│   │   │   └── dashboards/
│   │   │       ├── HospitalDashboard.tsx
│   │   │       ├── PublicDashboard.tsx
│   │   │       └── PharmacyDashboard.tsx
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   ├── hospitalController.ts
│   │   │   ├── aiController.ts
│   │   │   └── alertController.ts
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Hospital.ts
│   │   │   └── Alert.ts
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── patientRoutes.ts
│   │   │   ├── hospitalRoutes.ts
│   │   │   ├── aiRoutes.ts
│   │   │   └── alertRoutes.ts
│   │   ├── middleware/      # Express middleware
│   │   │   └── authMiddleware.ts
│   │   ├── services/        # Business logic
│   │   │   └── agentService.ts
│   │   └── server.ts        # Express app
│   ├── .env                 # Environment variables
│   └── package.json
│
├── ai-model/                 # Python AI service
│   ├── ai_service.py        # Flask app
│   ├── requirements.txt     # Python dependencies
│   └── models/              # ML models (if any)
│
├── data/                     # Sample data
│   └── sample_data.json
│
├── .gitignore
├── README.md                 # This file
├── API_DOCUMENTATION.md      # API reference
├── AGENT_CONTROL_UPDATES.md  # Feature docs
└── CHATBOT_FEATURE.md        # Chatbot docs
```

---

## 🔍 Key Code Locations

### Patient Admission Logic
- **Frontend:** `frontend/src/pages/AgentControlRoom.tsx` (lines 130-157)
- **Backend:** `backend/src/controllers/patientController.ts` (admitPatient function)
- **AI Evaluation:** `ai-model/ai_service.py` (/evaluate_patient endpoint)

### AI Chatbot
- **Frontend UI:** `frontend/src/pages/AgentControlRoom.tsx` (lines 543-643)
- **Chat Handler:** `frontend/src/pages/AgentControlRoom.tsx` (lines 165-200)
- **AI Service:** `ai-model/ai_service.py` (/chat endpoint)

### Authentication
- **Frontend:** `frontend/src/pages/Login.tsx`, `frontend/src/pages/Signup.tsx`
- **Backend:** `backend/src/controllers/authController.ts`
- **Middleware:** `backend/src/middleware/authMiddleware.ts`

### Forecasting
- **Frontend:** `frontend/src/pages/Forecasts.tsx`
- **Backend:** `backend/src/controllers/aiController.ts`
- **AI Models:** `ai-model/ai_service.py` (/predict/final endpoint)

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

### Manual Testing
1. Start all services
2. Navigate to http://localhost:5173
3. Sign up as hospital staff
4. Test patient admission
5. Test AI chatbot
6. Check forecasts page

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Development Team** - Initial work

---

## 🙏 Acknowledgments

- GROQ for AI API
- Hugging Face for model hosting
- MongoDB for database
- React and Node.js communities

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [CHATBOT_FEATURE.md](./CHATBOT_FEATURE.md)

---

**Built with ❤️ for better healthcare**