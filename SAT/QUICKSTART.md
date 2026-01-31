# 🚀 Quick Start Guide - SAT

Get the SAT platform running in under 5 minutes!

---

## ⚡ Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (need 18+)
node --version

# Check Python version (need 3.11+)
python --version

# Check MongoDB
mongod --version

# Check npm
npm --version
```

---

## 📦 Installation (One-Time Setup)

### Step 1: Install All Dependencies

```bash
# From project root
cd SAT

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install AI service dependencies
cd ai-model && pip install -r requirements.txt && cd ..
```

---

## ⚙️ Configuration (One-Time Setup)

### Create Backend Environment File

```bash
cd backend
cat > .env << 'EOF'
PORT=5001
MONGO_URI=mongodb://localhost:27017/medicast
JWT_SECRET=your_secure_random_secret_here
NODE_ENV=development

GROQ_API_KEY=your_groq_api_key_here
HF_TOKEN=your_huggingface_token_here
EOF
cd ..
```

---

## 🏃 Running the Application

### Option 1: Manual Start (4 Terminals)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5001

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

**Terminal 4 - AI Service:**
```bash
cd ai-model
export GROQ_API_KEY=your_groq_api_key_here
python ai_service.py
```
✅ AI Service running on http://localhost:5002

---

### Option 2: Quick Start Script

Create `start.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting SAT Platform..."

# Start MongoDB
echo "📊 Starting MongoDB..."
mongod &

# Wait for MongoDB
sleep 3

# Start Backend
echo "⚙️  Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for Backend
sleep 5

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start AI Service
echo "🤖 Starting AI Service..."
cd ai-model
export GROQ_API_KEY=your_groq_api_key_here
python ai_service.py &
AI_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "⚙️  Backend:  http://localhost:5001"
echo "🤖 AI:       http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
```

Make it executable and run:
```bash
chmod +x start.sh
./start.sh
```

---

## 🎯 First Steps After Starting

### 1. Open the Application
Navigate to: http://localhost:5173

### 2. Create an Account
- Click "Get Started"
- Choose "Hospital Staff"
- Fill in details:
  - Name: Test Hospital
  - Email: test@hospital.com
  - Hospital Code: HOSP123
  - Password: password123

### 3. Explore Features

**Agent Control Room:**
- Click "Agent Control" in sidebar
- Click "Admit Simulation" to add a patient
- Select initial status (WAITING/ER/ICU/WARD)
- Watch AI evaluate and triage

**AI Chatbot:**
- Click the purple chat button (bottom-right)
- Ask: "How many patients are in the system?"
- Ask: "What's the ICU occupancy rate?"

**Forecasts:**
- Click "Forecasts" in sidebar
- View 14-day predictions
- See confidence intervals

---

## 🧪 Quick Test

Verify everything is working:

```bash
# Test Backend
curl http://localhost:5001/health
# Should return: {"status":"ok"}

# Test AI Service
curl -X POST http://localhost:5002/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","role":"public"}'
# Should return AI response

# Test Frontend
# Open http://localhost:5173 in browser
# Should see landing page
```

---

## 🛑 Stopping the Application

### If using manual start:
Press `Ctrl+C` in each terminal

### If using PM2:
```bash
pm2 stop all
pm2 delete all
```

### Kill all processes:
```bash
# Kill by port
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:5002 | xargs kill -9  # AI Service
lsof -ti:5173 | xargs kill -9  # Frontend
```

---

## 🐛 Troubleshooting

### MongoDB not starting?
```bash
# Check if already running
ps aux | grep mongod

# Start manually
mongod --dbpath /usr/local/var/mongodb
```

### Port already in use?
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in backend/.env
PORT=5002
```

### AI Service errors?
```bash
# Check GROQ API key
echo $GROQ_API_KEY

# Reinstall dependencies
cd ai-model
pip install -r requirements.txt --force-reinstall
```

### Frontend not loading?
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

---

## 📊 Verify Services

Check all services are running:

```bash
# Backend
curl http://localhost:5001/health

# Frontend (in browser)
http://localhost:5173

# AI Service
curl http://localhost:5002/health
```

---

## 🎓 Next Steps

1. Read [README.md](./README.md) for complete documentation
2. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
3. Review [CHATBOT_FEATURE.md](./CHATBOT_FEATURE.md) for chatbot details
4. Explore [AGENT_CONTROL_UPDATES.md](./AGENT_CONTROL_UPDATES.md) for features

---

## 💡 Pro Tips

1. **Use PM2 for production:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

2. **Enable auto-restart:**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Monitor logs:**
   ```bash
   pm2 logs
   ```

4. **Check status:**
   ```bash
   pm2 status
   ```

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] AI Service running on port 5002
- [ ] Can access http://localhost:5173
- [ ] Can create account
- [ ] Can admit patient
- [ ] AI chatbot responds
- [ ] Forecasts page loads

---

**You're all set! 🎉**

Happy coding! If you encounter issues, check the troubleshooting section or open an issue.
