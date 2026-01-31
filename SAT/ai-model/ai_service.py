import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

# RAG System Imports
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from predict_pipeline import run_predict_pipeline
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ai_service_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
load_dotenv(dotenv_path)

# Initialize Flask App
app = Flask(__name__)

# Enable CORS only for backend (localhost:5001)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5001", "http://127.0.0.1:5001",
            "http://localhost:5000", "http://127.0.0.1:5000",
            "http://localhost:5173", "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# --- Configuration ---
HF_MODEL_NAME = "openai/gpt-oss-20b" 
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/MASTER_DF.csv')

# --- Global State ---
client = None  # HF Client (kept for other models if needed)
groq_client = None # Groq Client
forecast_data = None

# RAG System
rag_embedding_model = None
qdrant_client = None
RAG_COLLECTION_NAME = "healthcare_docs"

def init_rag_system():
    """Initialize RAG system components"""
    global rag_embedding_model, qdrant_client
    
    try:
        logger.info("🔍 Initializing RAG system...")
        
        # Load embedding model
        model_path = "./models/all-MiniLM-L6-v2"
        if os.path.exists(model_path):
             rag_embedding_model = SentenceTransformer(model_path)
             logger.info(f"✅ RAG embedding model loaded from local path: {model_path}")
        else:
             rag_embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
             logger.info("✅ RAG embedding model loaded from HuggingFace")
        logger.info("✅ RAG embedding model loaded")
        
        # Connect to Qdrant
        qdrant_client = QdrantClient(path="./qdrant_data")
        
        # Check if collection exists
        try:
            collection_info = qdrant_client.get_collection(RAG_COLLECTION_NAME)
            logger.info(f"✅ RAG collection '{RAG_COLLECTION_NAME}' found with {collection_info.points_count} documents")
        except:
            logger.warning(f"⚠️  RAG collection '{RAG_COLLECTION_NAME}' not found. Run ingest_documents.py first.")
            
    except Exception as e:
        logger.error(f"❌ RAG initialization error: {e}")
        logger.warning("⚠️  RAG features will be disabled")

# --- Load Data ---
def load_data():
    global forecast_data
    try:
        if os.path.exists(DATA_PATH):
            forecast_data = pd.read_csv(DATA_PATH)
            logger.info(f"✅ Loaded data from {DATA_PATH}: {forecast_data.shape}")
        else:
            logger.warning(f"⚠️  Data file not found at {DATA_PATH}")
    except Exception as e:
        logger.error(f"❌ Error loading data: {e}")

# --- Initialize HF Client ---
def get_hf_client():
    global client
    if client is None:
        token = os.getenv("HF_TOKEN")
        if not token:
            logger.warning("⚠️  HF_TOKEN not found in .env. Using anonymous access (rate limited).")
        else:
            logger.info("✅ HF_TOKEN loaded successfully")
        client = InferenceClient(model=HF_MODEL_NAME, token=token)
    return client

# ... (existing code) ...

# --- Initialize Groq Client ---
def get_groq_client():
    global groq_client
    if groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.error("❌ GROQ_API_KEY not found in .env")
            return None
        try:
            from groq import Groq
            groq_client = Groq(api_key=api_key)
            logger.info("✅ Groq client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Groq client: {e}")
            return None
    return groq_client

# ... (existing code) ...


# --- Database Connection ---
from pymongo import MongoClient

mongo_client = None
db = None

def get_db_connection():
    global mongo_client, db
    if mongo_client is None:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/medicast")
        try:
             mongo_client = MongoClient(mongo_uri)
             db = mongo_client.get_database() # Uses db name from URI
             logger.info("✅ Connected to MongoDB for Real-Time Data")
        except Exception as e:
             logger.error(f"❌ MongoDB connection failed: {e}")
             return None
    return db

def get_real_time_patient_data():
    """Fetch real-time stats from the patients collection"""
    database = get_db_connection()
    if database is None:
        return None
    
    try:
        patients_col = database['patients']
        
        # Aggregations
        total_patients = patients_col.count_documents({})
        by_status = list(patients_col.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]))
        
        # High Risk Patients (Name and Score)
        high_risk = list(patients_col.find(
            {"riskScore": {"$gte": 70}},
            {"name": 1, "riskScore": 1, "status": 1, "_id": 0}
        ).sort("riskScore", -1).limit(5))

        # **FETCH RECENT PATIENTS (Fix for reading names)**
        recent_patients = list(patients_col.find(
            {}, 
            {"name": 1, "age": 1, "status": 1, "chiefComplaint": 1, "_id": 0}
        ).sort("updatedAt", -1).limit(100)) # Get last 100 active patients
        
        # Format the data for the LLM
        status_summary = ", ".join([f"{item['_id']}: {item['count']}" for item in by_status])
        high_risk_summary = ", ".join([f"{p['name']} (Score: {p.get('riskScore')}, {p.get('status')})" for p in high_risk])
        patient_list_summary = "\n".join([f"- {p['name'].title()} ({p.get('age')}y, {p.get('status')}): {p.get('chiefComplaint', 'No complaint')}" for p in recent_patients])
        
        return {
            "total_patients": total_patients,
            "status_breakdown": status_summary,
            "high_risk_summary": high_risk_summary or "None",
            "patient_list": patient_list_summary
        }
    except Exception as e:
        logger.error(f"❌ Error fetching patient data: {e}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    """AI Chat endpoint using Groq"""
    logger.info("💬 Chat request received")
    
    data = request.json
    user_message = data.get('message', '')
    role_context = data.get('role', 'public')
    
    logger.info(f"📝 User message (role={role_context}): {user_message[:50]}...")
    
    if not user_message:
        logger.warning("⚠️  Empty message received")
        return jsonify({"error": "Message is required"}), 400

    try:
        client = get_groq_client()
        if not client:
             return jsonify({
                "error": "Groq API key not configured. Please add GROQ_API_KEY to your .env file.",
                "fallback_response": "System configuration error: Groq API key missing."
            }), 500

        # === RAG INTEGRATION ===
        # Retrieve relevant context from knowledge base
        rag_context = ""
        if rag_embedding_model is not None and qdrant_client is not None:
            try:
                logger.info("🔍 Retrieving RAG context...")
                query_embedding = rag_embedding_model.encode(user_message).tolist()
                
                # Search for relevant documents
                rag_results = qdrant_client.search(
                    collection_name=RAG_COLLECTION_NAME,
                    query_vector=query_embedding,
                    limit=2  # Top 2 most relevant documents
                )
                
                if rag_results:
                    logger.info(f"✅ Found {len(rag_results)} relevant documents for context")
                    rag_context = "\n\nRelevant Information from Knowledge Base:\n"
                    for i, result in enumerate(rag_results, 1):
                        rag_context += f"\n{i}. {result.payload['title']}: {result.payload['content'][:300]}...\n"
                else:
                    logger.info("ℹ️  No relevant documents found")
            except Exception as rag_error:
                logger.warning(f"⚠️  RAG retrieval failed: {rag_error}")
                # Continue without RAG context

        # === REAL-TIME DATA INTEGRATION ===
        real_time_data = get_real_time_patient_data()
        real_time_context = ""
        if real_time_data:
            real_time_context = (
                "\n\n### LIVE HOSPITAL STATUS (REAL-TIME) ###\n"
                f"- Total Patients Admitted: {real_time_data['total_patients']}\n"
                f"- Status Breakdown: {real_time_data['status_breakdown']}\n"
                f"- Critical/High Risk Patients: {real_time_data['high_risk_summary']}\n"
                "\n### DETAILED PATIENT LIST ###\n"
                f"{real_time_data.get('patient_list', 'No data')}\n\n"
                "Use this data to answer questions about specific patients, occupancy, and status."
            )

        # Construct Advanced System Prompt based on Role
        base_prompt = (
            "You are Life_Saver AI, an advanced medical forecasting assistant powered by fine-tuned models and real-world data. "
            "Your goal is to provide precise, data-driven insights to healthcare professionals and the public. "
            "Always maintain a professional, empathetic, and authoritative tone. "
            "When analyzing trends, refer to specific metrics (e.g., '15% rise in ICU demand') rather than vague statements."
        )
        
        role_prompts = {
            'hospital_staff': (
                "You are a specialized assistant for Hospital Administrators and Staff. "
                "Focus on: ICU bed occupancy, oxygen supply chain, staffing ratios, and patient admission surges. "
                "Prioritize patient safety and operational efficiency. "
                "If resources are low, suggest immediate mitigation strategies like 'activating surge protocols' or 'postponing elective surgeries'."
            ),
            'pharmacy': (
                "You are a specialized assistant for Pharmacy Managers. "
                "Focus on: Inventory management, demand forecasting for critical drugs (e.g., Remdesivir, Paracetamol), and supply chain bottlenecks. "
                "Alert users early about potential stockouts based on predicted infection trends."
            ),
            'admin': (
                "You are a specialized assistant for Government Health Officials. "
                "Focus on: Macro-level trends, regional hotspots, resource allocation across hospitals, and public health policy. "
                "Provide high-level summaries and strategic recommendations for containment."
            ),
            'public': (
                "You are a helpful health advisor for the general public. "
                "Focus on: Personal safety measures, AQI warnings, vaccination advice, and dispelling rumors. "
                "Keep language simple, reassuring, and actionable. Avoid medical jargon."
            )
        }
        
        system_prompt = f"{base_prompt}\n\n{role_prompts.get(role_context, role_prompts['public'])}"
        
        # Add Real-Time Data to Prompt
        if real_time_context:
            system_prompt += real_time_context
        
        # Add RAG context instruction if available
        if rag_context:
            system_prompt += (
                "\n\n### CONTEXT FROM KNOWLEDGE BASE ###\n"
                "Use the following retrieved documents to answer the user's question accurately. "
                "Cite specific details where possible.\n"
            )

        # Construct user message with RAG context
        enhanced_message = user_message
        if rag_context:
            enhanced_message = f"{user_message}{rag_context}"

        # Add strict instruction to prevent hallucination
        system_prompt += "\n\nIMPORTANT: Answer ONLY the user's question. Do NOT simulate a conversation. Do NOT generate user responses. Stop immediately after answering."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": enhanced_message}
        ]

        logger.info(f"🤖 Calling Groq API: llama-3.3-70b-versatile")
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
            top_p=1,
            stream=False,
            stop=None,
        )

        response_text = completion.choices[0].message.content

        logger.info(f"✅ Chat response generated: {len(response_text)} chars")
        return jsonify({"response": response_text})

    except Exception as e:
        logger.error(f"❌ Chat generation error: {e}", exc_info=True)
        return jsonify({
            "error": f"Failed to generate response: {str(e)}",
            "fallback_response": "I'm having trouble connecting right now. Please try again in a moment."
        }), 500

@app.route('/predict/final', methods=['GET'])
def predict_final():
    """
    Main endpoint for frontend to get forecasts.
    Query params:
    - role: 'public', 'hospital_staff', 'pharmacy', 'admin'
    - horizon: int (default 14)
    """
    try:
        role = request.args.get('role', 'public')
        horizon = int(request.args.get('horizon', 14))
        
        logger.info(f"🚀 Forecast request received: role={role}, horizon={horizon}")
        
        # Run the full pipeline
        logger.info("🔄 Starting multi-model pipeline...")
        hf_token = os.getenv("HF_TOKEN")
        result = run_predict_pipeline(role=role, hf_token=hf_token, horizon=horizon)
        
        logger.info(f"✅ Forecast complete! Ensemble Confidence: {result.get('ensemble_confidence', 0):.2%}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"❌ Forecast error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/predict/pipeline', methods=['POST'])
def predict_pipeline_endpoint():
    """
    Endpoint for detailed pipeline execution (used by backend controller)
    """
    try:
        data = request.json
        role = data.get('role', 'public')
        horizon = data.get('horizon', 14)
        
        logger.info(f"🚀 Pipeline request received: role={role}, horizon={horizon}")
        
        hf_token = os.getenv("HF_TOKEN")
        result = run_predict_pipeline(role=role, hf_token=hf_token, horizon=horizon)
        
        return jsonify(result)

    except Exception as e:
        logger.error(f"❌ Pipeline error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# --- AGENTIC ENDPOINTS ---
from agents.orchestrator import DecisionOrchestrator
orchestrator = DecisionOrchestrator()

@app.route('/evaluate_patient', methods=['POST'])
def evaluate_patient():
    """
    Agentic Decision Endpoint.
    Receives: { patient: {...}, hospital_state: {...} }
    Returns: Decision JSON
    """
    try:
        data = request.json
        patient_data = data.get('patient', {})
        hospital_state = data.get('hospital_state', {})
        
        logger.info(f"🤖 Agent Evaluation Request for: {patient_data.get('name', 'Unknown')}")
        
        decision = orchestrator.decide(patient_data, hospital_state)
        
        logger.info(f"✅ Agent Decision: {decision['decision']['action']}")
        return jsonify(decision)

    except Exception as e:
        logger.error(f"❌ Agent error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("🚀 Starting AI Service (Multi-Model Forecasting + RAG)")
    logger.info("=" * 60)
    
    load_data()
    # Prevent double initialization in debug mode
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
         init_rag_system()  # Initialize RAG system
    
    logger.info("🌐 CORS enabled for: http://localhost:5001")
    logger.info("🔧 Debug mode: ENABLED")
    logger.info("🎯 Running on: http://0.0.0.0:5002")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=5002, debug=False)
