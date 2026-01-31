import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os
from huggingface_hub import HfApi, upload_file
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/MASTER_DF1.csv")
MODEL_PATH = "trained_model.joblib"
HF_REPO_ID = "harshpatel/medicast-forecaster" # Replace with user's actual repo if known, or generic

def load_and_preprocess_data():
    logger.info("Loading data...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    
    # Ensure date column is datetime
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
    
    # Assume 'value' is the target column. If not, we might need to adjust based on actual CSV structure.
    # For now, let's assume a simple structure or try to find the target.
    # If MASTER_DF has multiple columns, we'll try to identify the target.
    target_col = 'value'
    if target_col not in df.columns:
        # Fallback: use the last column or a specific one if known. 
        # Let's check if 'admissions' or similar exists.
        possible_targets = ['admissions', 'count', 'demand', 'y']
        for col in possible_targets:
            if col in df.columns:
                target_col = col
                break
        else:
            # If still not found, use the last numeric column
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                target_col = numeric_cols[-1]
            else:
                raise ValueError("No suitable target column found in data")
    
    logger.info(f"Using target column: {target_col}")
    
    # Feature Engineering
    logger.info("Generating features...")
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    
    # Lag features
    for lag in [1, 7, 14, 30]:
        df[f'lag_{lag}'] = df[target_col].shift(lag)
    
    # Rolling means
    for window in [7, 30]:
        df[f'rolling_mean_{window}'] = df[target_col].rolling(window=window).mean()
    
    # Drop NaNs created by lags
    df = df.dropna()
    
    return df, target_col

def train_model_for_target(df, target_col):
    logger.info(f"🎯 Training models for target: {target_col}")
    
    # Select only numeric columns for features
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    features = [col for col in numeric_cols if col not in [target_col, 'date']]
    X = df[features]
    y = df[target_col]
    
    logger.info(f"Training on {len(df)} samples with {len(features)} features")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    # Train Random Forest
    logger.info("Training Random Forest...")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    # Train Gradient Boosting
    logger.info("Training Gradient Boosting...")
    from sklearn.ensemble import GradientBoostingRegressor
    gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    gb_model.fit(X_train, y_train)
    
    # Evaluate
    rf_pred = rf_model.predict(X_test)
    gb_pred = gb_model.predict(X_test)
    ensemble_pred = (rf_pred + gb_pred) / 2
    
    rf_mae = mean_absolute_error(y_test, rf_pred)
    gb_mae = mean_absolute_error(y_test, gb_pred)
    ensemble_mae = mean_absolute_error(y_test, ensemble_pred)
    
    logger.info(f"Random Forest MAE: {rf_mae:.2f}")
    logger.info(f"Gradient Boosting MAE: {gb_mae:.2f}")
    logger.info(f"Ensemble MAE: {ensemble_mae:.2f}")
    
    # Save models with target suffix
    suffix = target_col.replace('new_', '').replace('_units_used', '').replace('_admissions', '')
    if suffix == 'admissions': suffix = 'admissions' # Handle edge case if needed, but 'new_admissions' -> 'admissions' is fine
    
    # Map full column names to simple suffixes
    name_map = {
        'new_admissions': 'admissions',
        'icu_admissions': 'icu',
        'oxygen_units_used': 'oxygen'
    }
    simple_name = name_map.get(target_col, target_col)
    
    logger.info(f"Saving models for {simple_name}...")
    joblib.dump(rf_model, f"trained_model_rf_{simple_name}.joblib")
    joblib.dump(gb_model, f"trained_model_gb_{simple_name}.joblib")
    
    # Save feature names for inference (only need once really, but safe to overwrite)
    joblib.dump(features, "model_features.joblib")
    
    return True

def train_all_models():
    try:
        df, _ = load_and_preprocess_data()
        
        targets = ['new_admissions', 'icu_admissions', 'oxygen_units_used']
        
        # Verify targets exist
        available_targets = [t for t in targets if t in df.columns]
        if not available_targets:
            logger.error("❌ No valid targets found in dataset")
            return False
            
        success = True
        for target in available_targets:
            if not train_model_for_target(df, target):
                success = False
        
        logger.info("✅ Multi-target training complete")
        return success
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        return False

def upload_to_huggingface():
    token = os.getenv("HF_TOKEN")
    if not token:
        logger.warning("⚠️  HF_TOKEN not found. Skipping upload to Hugging Face.")
        return

    try:
        logger.info(f"Uploading model to Hugging Face Hub...")
        api = HfApi(token=token)
        
        # Create repo if not exists (this might fail if user doesn't have permissions or it exists)
        # We'll just try to upload
        
        # For this demo, we'll assume the user wants to upload to their profile
        # We need a repo name. Let's use a generic one or ask the user.
        # Since we can't ask easily in this flow, we'll try to create 'medicast-model'
        
        user_info = api.whoami()
        username = user_info['name']
        repo_id = f"{username}/medicast-model"
        
        try:
            api.create_repo(repo_id=repo_id, exist_ok=True)
        except Exception as e:
            logger.warning(f"Could not create repo {repo_id}: {e}")
        
        upload_file(
            path_or_fileobj=MODEL_PATH,
            path_in_repo="trained_model.joblib",
            repo_id=repo_id,
            token=token
        )
        
        upload_file(
            path_or_fileobj="model_features.joblib",
            path_in_repo="model_features.joblib",
            repo_id=repo_id,
            token=token
        )
        
        logger.info(f"✅ Model uploaded successfully to https://huggingface.co/{repo_id}")
        
    except Exception as e:
        logger.error(f"❌ Failed to upload to Hugging Face: {e}")

if __name__ == "__main__":
    if train_all_models():
        upload_to_huggingface()
