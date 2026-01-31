import pandas as pd
import numpy as np
from utils import get_db_connection
import pickle
import os
from datetime import datetime, timedelta

def generate_predictions(city, hospital_id=None):
    """
    Generate predictions for a specific city or hospital.
    If hospital_id is provided, generates for that hospital.
    Otherwise aggregates for the city.
    """
    print(f"Generating predictions for City: {city}, Hospital: {hospital_id}")
    
    # 1. Load Model
    model_path = 'models/forecast_model.pkl'
    if not os.path.exists(model_path):
        print("Model not found, using default fallback logic")
        # In a real scenario, we might trigger training or fail
    
    # 2. Generate Forecast Dates (Next 14 days)
    dates = [datetime.now() + timedelta(days=i) for i in range(14)]
    
    # 3. Mock Prediction Logic (Replace with actual model inference)
    # This simulates the output of the Qwen model
    predictions = []
    
    for date in dates:
        # Random variations to look realistic
        base_beds = 120
        base_icu = 25
        
        prediction = {
            "hospitalId": hospital_id, # If None, this might be a city-wide aggregate
            "date": date,
            "type": "beds", # We might generate multiple types per date
            "currentValue": base_beds + np.random.randint(-5, 5),
            "predictedValue": base_beds + np.random.randint(-10, 20), # Trend up/down
            "riskLevel": np.random.choice(['low', 'medium', 'high'], p=[0.7, 0.2, 0.1]),
            "factors": ["Seasonal Flu", "Air Quality Index > 150"],
            "createdAt": datetime.now()
        }
        predictions.append(prediction)
        
        # Add ICU prediction
        predictions.append({
            "hospitalId": hospital_id,
            "date": date,
            "type": "icu",
            "currentValue": base_icu + np.random.randint(-2, 2),
            "predictedValue": base_icu + np.random.randint(-5, 8),
            "riskLevel": np.random.choice(['low', 'medium', 'high'], p=[0.8, 0.15, 0.05]),
            "factors": ["Critical Cases Surge"],
            "createdAt": datetime.now()
        })

    # 4. Save to MongoDB
    db = get_db_connection()
    predictions_collection = db['predictions']
    
    # Optional: Clear old predictions for this scope to avoid duplicates
    # predictions_collection.delete_many({"hospitalId": hospital_id})
    
    if predictions:
        predictions_collection.insert_many(predictions)
        print(f"Saved {len(predictions)} predictions to MongoDB")
    
    return predictions

if __name__ == "__main__":
    # Test run
    # In production, this would be called by the backend or a cron job
    # We need a valid hospital ID to test properly, or handle None
    generate_predictions("Mumbai", "6745778899aabbccddeeff00") # Mock ID
