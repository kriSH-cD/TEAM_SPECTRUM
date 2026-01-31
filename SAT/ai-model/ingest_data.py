import pandas as pd
from datasets import load_dataset
from utils import get_db_connection
import numpy as np
from datetime import datetime, timedelta

def ingest_data():
    print("Starting data ingestion from Hugging Face...")
    
    try:
        # Load dataset from Hugging Face
        dataset = load_dataset("Nicolybgs/healthcare_data", split="train")
        df = dataset.to_pandas()
        print(f"Successfully loaded {len(df)} records from Nicolybgs/healthcare_data")
        
        # Map Ward_Facility_Code to Hospital Names
        # The dataset has codes like A, B, C, D, E, F
        unique_wards = df['Ward_Facility_Code'].unique()
        print(f"Found Ward Codes: {unique_wards}")
        
        ward_to_hospital = {
            code: f"City Hospital - Block {code}" for code in unique_wards
        }
        
        df['Hospital'] = df['Ward_Facility_Code'].map(ward_to_hospital)
        
        # Generate Synthetic Dates
        # Distribute admissions over the last 365 days
        print("Generating synthetic dates...")
        start_date = datetime.now() - timedelta(days=365)
        # Random number of days to add to start_date for each row
        days_offset = np.random.randint(0, 365, size=len(df))
        df['Date'] = [start_date + timedelta(days=int(d)) for d in days_offset]
        
        db = get_db_connection()
        hospitals_collection = db['hospitals']
        predictions_collection = db['predictions']
        
        # Clear existing data for clean slate (optional, good for dev)
        # hospitals_collection.delete_many({})
        # predictions_collection.delete_many({})

        # 1. Extract unique hospitals and populate 'hospitals' collection
        unique_hospitals = df['Hospital'].unique()
        print(f"Mapped to {len(unique_hospitals)} unique hospitals")
        
        hospital_id_map = {}
        
        for hospital_name in unique_hospitals:
            # Check if exists
            existing = hospitals_collection.find_one({"name": hospital_name})
            
            if existing:
                hospital_id_map[hospital_name] = existing['_id']
            else:
                # Create new hospital entry
                new_hospital = {
                    "name": hospital_name,
                    "city": "Mumbai", 
                    "location": f"Sector {np.random.randint(1, 20)}",
                    "totalBeds": np.random.randint(100, 1000),
                    "icuBeds": np.random.randint(20, 100),
                    "departments": ["General", "ICU", "Emergency", "Gynecology", "Radiotherapy", "Anesthesia"],
                    "createdAt": datetime.now()
                }
                result = hospitals_collection.insert_one(new_hospital)
                hospital_id_map[hospital_name] = result.inserted_id
                print(f"Created hospital: {hospital_name}")

        # 2. Generate Predictions/Trends based on this data
        # Aggregate by Hospital and Date
        # We convert Date to just date part for grouping
        df['DateOnly'] = df['Date'].dt.date
        daily_admissions = df.groupby(['Hospital', 'DateOnly']).size().reset_index(name='admissions')
        
        print("Generating predictions based on historical trends...")
        
        predictions_to_insert = []
        
        for hospital_name, group in daily_admissions.groupby('Hospital'):
            hospital_id = hospital_id_map.get(hospital_name)
            if not hospital_id:
                continue
                
            # Calculate stats
            avg_admissions = group['admissions'].mean()
            
            # Generate 14 days of future predictions
            for i in range(14):
                future_date = datetime.now() + timedelta(days=i)
                
                # Predict Bed Usage (Admissions * Avg Stay ~ 5 days)
                # Add some randomness and trend
                predicted_beds = int(avg_admissions * 5 * np.random.uniform(0.8, 1.2))
                
                predictions_to_insert.append({
                    "hospitalId": hospital_id,
                    "date": future_date,
                    "type": "beds",
                    "currentValue": int(predicted_beds * 0.9), # Current is slightly less than predicted usually
                    "predictedValue": predicted_beds,
                    "riskLevel": np.random.choice(['low', 'medium', 'high'], p=[0.6, 0.3, 0.1]),
                    "factors": ["Seasonal Trend", "Ward Occupancy High"],
                    "createdAt": datetime.now()
                })
                
                # Predict ICU Usage (approx 10-20% of beds)
                predicted_icu = int(predicted_beds * np.random.uniform(0.1, 0.2))
                predictions_to_insert.append({
                    "hospitalId": hospital_id,
                    "date": future_date,
                    "type": "icu",
                    "currentValue": int(predicted_icu * 0.9),
                    "predictedValue": predicted_icu,
                    "riskLevel": np.random.choice(['low', 'medium', 'high'], p=[0.7, 0.2, 0.1]),
                    "factors": ["Critical Care Demand"],
                    "createdAt": datetime.now()
                })
                
        if predictions_to_insert:
            # Batch insert
            predictions_collection.insert_many(predictions_to_insert)
            print(f"Inserted {len(predictions_to_insert)} predictions based on real-world data patterns")
            
    except Exception as e:
        print(f"Error during ingestion: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    ingest_data()
