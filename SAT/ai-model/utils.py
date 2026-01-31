import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import numpy as np

# Load environment variables
# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct path to .env file (assuming it's in ../backend/.env relative to this script)
dotenv_path = os.path.join(current_dir, '..', 'backend', '.env')
load_dotenv(dotenv_path=dotenv_path)

def get_db_connection():
    """Connect to MongoDB using the URI from .env"""
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        raise ValueError("MONGO_URI not found in environment variables")
    
    client = MongoClient(mongo_uri)
    db = client.get_database('medicast') # Explicitly get the database
    return db

def load_data(collection_name, query=None):
    """Load data from a specific MongoDB collection into a DataFrame"""
    db = get_db_connection()
    collection = db[collection_name]
    
    if query is None:
        query = {}
        
    cursor = collection.find(query)
    df = pd.DataFrame(list(cursor))
    
    if '_id' in df.columns:
        df.drop('_id', axis=1, inplace=True)
        
    return df

def preprocess_data(df):
    """Basic preprocessing: handle missing values, normalize"""
    # Placeholder for actual preprocessing logic
    df.fillna(method='ffill', inplace=True)
    return df

if __name__ == "__main__":
    # Test connection
    try:
        db = get_db_connection()
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Connection failed: {e}")
