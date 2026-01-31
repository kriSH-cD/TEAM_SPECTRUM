"""
Document Ingestion Script for RAG System
Creates embeddings and stores them in Qdrant vector database
"""

import os
from typing import List, Dict
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import uuid

# Initialize embedding model
print("Loading embedding model...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # Fast, efficient model
EMBEDDING_DIM = 384  # Dimension for all-MiniLM-L6-v2

# Initialize Qdrant client (local instance)
print("Connecting to Qdrant...")
qdrant_client = QdrantClient(path="./qdrant_data")  # Local storage

# Collection name
COLLECTION_NAME = "healthcare_docs"

def create_collection():
    """Create Qdrant collection if it doesn't exist"""
    try:
        qdrant_client.get_collection(COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' already exists")
    except:
        print(f"Creating collection '{COLLECTION_NAME}'...")
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE)
        )
        print("Collection created successfully")

def prepare_documents() -> List[Dict]:
    """Prepare healthcare knowledge base documents"""
    documents = [
        # Hospital Operations
        {
            "category": "hospital_operations",
            "title": "ICU Capacity Management",
            "content": "ICU capacity is critical for emergency care. Our hospitals maintain 50 ICU beds on average with surge capacity protocols. When ICU utilization exceeds 85%, we activate surge capacity by converting post-operative recovery units. Critical threshold is 90% occupancy requiring immediate resource allocation."
        },
        {
            "category": "hospital_operations",
            "title": "Oxygen Supply Management",
            "content": "Oxygen supply is monitored continuously. Standard stock is 1000 units per facility. When demand exceeds 850 units (85% threshold), automatic reorder is triggered. Emergency oxygen reserves are maintained at 200 units. Suppliers are contacted when consumption rate exceeds normal by 20%."
        },
        {
            "category": "hospital_operations",
            "title": "Staff Scheduling Protocol",
            "content": "Staff scheduling follows a 4-week rotation. Minimum staffing ratios: 1 nurse per 4 patients for general wards, 1:2 for ICU. During high admission forecasts, additional staff are called in. Weekend shifts require 30% premium pay. Night shifts from 8 PM to 6 AM."
        },
        {
            "category": "hospital_operations",
            "title": "Patient Admission Process",
            "content": "Patient admissions are triaged based on severity. Emergency cases get immediate attention. Elective procedures are scheduled 2-4 weeks in advance. Pre-admission screening includes vitals, medical history, and insurance verification. Average admission time is 45 minutes for emergency, 2 hours for planned."
        },
        {
            "category": "hospital_operations",
            "title": "Resource Allocation Policy",
            "content": "Resources are allocated based on AI forecasts and real-time demand. Priority order: ICU equipment, ventilators, oxygen, medications, general supplies. During surge events, elective procedures may be postponed. Inter-hospital resource sharing activated when single facility exceeds 95% capacity."
        },
        
        # Medicine Demand & Pharmacy
        {
            "category": "medicine_demand",
            "title": "Paracetamol Inventory",
            "content": "Paracetamol (acetaminophen) is our highest-volume medication. Standard stock: 5000 units. Reorder point: 2000 units. Lead time from supplier: 3-5 days. Seasonal demand increases 40% during monsoon and winter. Used for fever, pain management, and post-operative care."
        },
        {
            "category": "medicine_demand",
            "title": "Antibiotic Management",
            "content": "Antibiotics are controlled substances requiring prescription. Stock levels: Amoxicillin 3000 units, Azithromycin 2000 units, Ciprofloxacin 1500 units. Strict antibiotic stewardship policy prevents overuse. Resistance monitoring conducted quarterly. Emergency reserve: 500 units broad-spectrum."
        },
        {
            "category": "medicine_demand",
            "title": "Mask and PPE Supply",
            "content": "Masks and PPE are essential for infection control. N95 masks: 10,000 stock, surgical masks: 50,000. Gloves: 100 boxes (100 per box). During outbreaks, mask demand can increase 10x. Automatic reorder triggered at 30% remaining stock. Supplier contracts ensure 48-hour delivery."
        },
        {
            "category": "medicine_demand",
            "title": "Cold Chain Medications",
            "content": "Temperature-sensitive medications require special storage. Vaccines stored at 2-8°C. Insulin and biologics at controlled room temperature. Power backup ensures 72-hour cold chain continuity. Daily temperature logs mandatory. Stock rotation follows FIFO (First In First Out)."
        },
        {
            "category": "medicine_demand",
            "title": "Emergency Medicine Stock",
            "content": "Emergency medications maintained 24/7: Epinephrine 200 doses, Naloxone 100 doses, emergency IV fluids 500 liters, emergency surgical supplies for 50 procedures. Monthly expiry checks. Critical shortages reported to admin within 2 hours."
        },
        
        # Admin Policies
        {
            "category": "admin_policy",
            "title": "Budget Allocation Rules",
            "content": "Annual healthcare budget allocated: 40% staffing, 30% equipment and supplies, 15% infrastructure, 10% technology/AI systems, 5% training. Emergency fund: 10% of total budget. Quarterly reviews with adjustments based on utilization and forecasts."
        },
        {
            "category": "admin_policy",
            "title": "Inter-Hospital Coordination",
            "content": "Regional coordination protocol requires daily capacity reporting. Overflow patients transferred to nearest facility with capacity. Ambulance dispatch follows 15-minute target. Regional command center active during emergencies. Data sharing agreement between all facilities."
        },
        {
            "category": "admin_policy",
            "title": "AI Forecast Integration Policy",
            "content": "AI forecasts reviewed daily by operations team. Forecasts with >80% confidence trigger automatic resource planning. Weekly model performance audits. Human override allowed for unusual situations. All AI recommendations logged for compliance. Monthly accuracy reports to board."
        },
        {
            "category": "admin_policy",
            "title": "Data Privacy and Security",
            "content": "Patient data follows HIPAA-equivalent standards. Encryption required for all transmissions. Access control: role-based permissions, 2FA for admin, audit trails for all access. Data retention: 7 years. Anonymization for AI training. Quarterly security audits."
        },
        {
            "category": "admin_policy",
            "title": "Quality Assurance Standards",
            "content": "Quality metrics tracked: patient satisfaction >90%, readmission rate <8%, average wait time <30 min for emergency, <2 hours for general. Monthly reviews. Staff training: 40 hours annually. Incident reporting mandatory within 24 hours. Root cause analysis for all adverse events."
        },
        
        # Environmental & Health Factors
        {
            "category": "health_factors",
            "title": "Air Quality Impact",
            "content": "Poor air quality (AQI >150) increases respiratory admissions by 25-40%. Masks recommended when AQI >100. Real-time AQI monitoring integrated with forecasts. Public alerts issued at AQI >200. Special protocols for asthma and COPD patients during high AQI periods."
        },
        {
            "category": "health_factors",
            "title": "Seasonal Disease Patterns",
            "content": "Monsoon season (June-September): 60% increase in waterborne diseases, malaria, dengue. Winter (December-February): 45% increase in respiratory infections, flu. Summer (March-May): heat-related illnesses, dehydration. Vaccine drives scheduled before peak seasons."
        },
        {
            "category": "health_factors",
            "title": "Temperature and Health",
            "content": "Extreme temperatures affect health outcomes. >35°C: heat exhaustion risk, increase cooling centers. <10°C: hypothermia risk for vulnerable populations. Temperature swings >10°C in 24 hours increase cardiac events by 15%. HVAC maintained at 22-24°C in facilities."
        },
        
        # Operational Best Practices
        {
            "category": "best_practices",
            "title": "Surge Capacity Activation",
            "content": "Surge capacity protocol activated when forecasts predict >120% normal capacity. Steps: 1) Alert all staff, 2) Convert recovery rooms to patient beds, 3) Extend operating hours, 4) Call in reserve staff, 5) Coordinate with other facilities, 6) Activate emergency supply chain."
        },
        {
            "category": "best_practices",
            "title": "Preventive Care Campaigns",
            "content": "Preventive care reduces emergency admissions by 30%. Annual health check-ups offered. Vaccination drives: flu (October), COVID boosters (quarterly), childhood immunizations (ongoing). Community health workers conduct door-to-door awareness. Free screening camps monthly."
        }
    ]
    
    return documents

def ingest_documents():
    """Ingest documents into Qdrant"""
    print("\nPreparing documents...")
    documents = prepare_documents()
    print(f"Total documents: {len(documents)}")
    
    print("\nGenerating embeddings...")
    points = []
    
    for idx, doc in enumerate(documents):
        # Combine title and content for embedding
        text = f"{doc['title']}. {doc['content']}"
        
        # Generate embedding
        embedding = embedding_model.encode(text).tolist()
        
        # Create point for Qdrant
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "category": doc["category"],
                "title": doc["title"],
                "content": doc["content"],
                "text": text
            }
        )
        points.append(point)
        
        if (idx + 1) % 5 == 0:
            print(f"  Processed {idx + 1}/{len(documents)} documents...")
    
    print(f"\nUploading {len(points)} points to Qdrant...")
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    print("✅ Document ingestion complete!")
    
    # Verify
    collection_info = qdrant_client.get_collection(COLLECTION_NAME)
    print(f"\nCollection stats:")
    print(f"  Total vectors: {collection_info.points_count}")
    print(f"  Vector dimensions: {EMBEDDING_DIM}")

def test_query():
    """Test the RAG system with a sample query"""
    print("\n" + "="*60)
    print("Testing RAG System")
    print("="*60)
    
    test_queries = [
        "What is the ICU capacity threshold?",
        "How much paracetamol stock do we maintain?",
        "What is the budget allocation for staffing?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        
        # Generate query embedding
        query_embedding = embedding_model.encode(query).tolist()
        
        # Search Qdrant
        results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=2
        )
        
        print("Top results:")
        for i, result in enumerate(results, 1):
            print(f"  {i}. [{result.payload['category']}] {result.payload['title']}")
            print(f"     Score: {result.score:.4f}")
            print(f"     Content: {result.payload['content'][:100]}...")

if __name__ == "__main__":
    print("="*60)
    print("Healthcare RAG System - Document Ingestion")
    print("="*60)
    
    # Create collection
    create_collection()
    
    # Ingest documents
    ingest_documents()
    
    # Test queries
    test_query()
    
    print("\n✅ Setup complete! RAG system is ready.")
    print("\nNext steps:")
    print("  1. Use /rag/query endpoint in ai_service.py")
    print("  2. Integrate RAG context into chatbot responses")
