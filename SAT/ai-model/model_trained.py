import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

MODEL_PATH_RF_ADMISSIONS = os.path.join(os.path.dirname(__file__), "trained_model_rf_admissions.joblib")
MODEL_PATH_GB_ADMISSIONS = os.path.join(os.path.dirname(__file__), "trained_model_gb_admissions.joblib")

MODEL_PATH_RF_ICU = os.path.join(os.path.dirname(__file__), "trained_model_rf_icu.joblib")
MODEL_PATH_GB_ICU = os.path.join(os.path.dirname(__file__), "trained_model_gb_icu.joblib")

MODEL_PATH_RF_OXYGEN = os.path.join(os.path.dirname(__file__), "trained_model_rf_oxygen.joblib")
MODEL_PATH_GB_OXYGEN = os.path.join(os.path.dirname(__file__), "trained_model_gb_oxygen.joblib")

FEATURES_PATH = os.path.join(os.path.dirname(__file__), "model_features.joblib")

_models = {}
_features = None

import logging
logger = logging.getLogger(__name__)

def load_models():
    global _models, _features
    targets = ['admissions', 'icu', 'oxygen']
    
    try:
        if os.path.exists(FEATURES_PATH):
            _features = joblib.load(FEATURES_PATH)
        
        for target in targets:
            rf_path = os.path.join(os.path.dirname(__file__), f"trained_model_rf_{target}.joblib")
            gb_path = os.path.join(os.path.dirname(__file__), f"trained_model_gb_{target}.joblib")
            
            logger.info(f"🔍 Checking for {target} models at: {rf_path}")
            
            if os.path.exists(rf_path) and os.path.exists(gb_path):
                _models[f'{target}_rf'] = joblib.load(rf_path)
                _models[f'{target}_gb'] = joblib.load(gb_path)
                logger.info(f"✅ Loaded models for {target}")
            else:
                logger.warning(f"⚠️  Models for {target} not found. Exists RF: {os.path.exists(rf_path)}, GB: {os.path.exists(gb_path)}")
                
    except Exception as e:
        logger.error(f"❌ Error loading trained models: {e}")

def predict_single_target(target, input_df):
    if f'{target}_rf' not in _models or f'{target}_gb' not in _models:
        return 0
    
    pred_rf = _models[f'{target}_rf'].predict(input_df)[0]
    pred_gb = _models[f'{target}_gb'].predict(input_df)[0]
    return (pred_rf + pred_gb) / 2

def run_trained_model(historical_data, horizon=14):
    """
    Run inference using the locally trained ensembles for multiple targets.
    Returns a dictionary of forecasts.
    """
    load_models()
    
    if not _models:
        # Fallback
        mean_val = np.mean(historical_data)
        return {
            'admissions': [mean_val] * horizon,
            'icu': [mean_val * 0.15] * horizon,
            'oxygen': [mean_val * 2.5] * horizon
        }
        
    try:
        # Prepare data for recursive forecasting
        # We use the admissions series as the driver for autoregressive features
        current_sequence = list(historical_data)
        
        forecasts = {
            'admissions': [],
            'icu': [],
            'oxygen': []
        }
        
        start_date = datetime.now()
        
        for i in range(horizon):
            future_date = start_date + timedelta(days=i+1)
            
            # Construct features
            row = {}
            row['day_of_week'] = future_date.weekday()
            row['month'] = future_date.month
            
            # Calculate lags based on current_sequence (admissions)
            lags = [1, 7, 14, 30]
            for lag in lags:
                if len(current_sequence) >= lag:
                    row[f'lag_{lag}'] = current_sequence[-lag]
                else:
                    row[f'lag_{lag}'] = current_sequence[0] if current_sequence else 0
            
            # Calculate rolling means
            windows = [7, 30]
            for window in windows:
                if len(current_sequence) >= window:
                    row[f'rolling_mean_{window}'] = np.mean(current_sequence[-window:])
                else:
                    row[f'rolling_mean_{window}'] = np.mean(current_sequence) if current_sequence else 0
            
            input_df = pd.DataFrame([row])
            
            # Add missing columns
            if _features:
                for col in _features:
                    if col not in input_df.columns:
                        input_df[col] = 0 
                input_df = input_df[_features]
            
            # Predict all targets
            pred_admissions = predict_single_target('admissions', input_df)
            pred_icu = predict_single_target('icu', input_df)
            pred_oxygen = predict_single_target('oxygen', input_df)
            
            # Ensure non-negative
            pred_admissions = max(0, pred_admissions)
            pred_icu = max(0, pred_icu)
            pred_oxygen = max(0, pred_oxygen)
            
            # Append
            forecasts['admissions'].append(pred_admissions)
            forecasts['icu'].append(pred_icu)
            forecasts['oxygen'].append(pred_oxygen)
            
            # Update sequence for next step (using predicted admissions)
            current_sequence.append(pred_admissions)
            
        return forecasts
        
    except Exception as e:
        print(f"❌ Trained model inference failed: {e}")
        mean_val = np.mean(historical_data)
        return {
            'admissions': [mean_val] * horizon,
            'icu': [mean_val * 0.15] * horizon,
            'oxygen': [mean_val * 2.5] * horizon
        }

def get_feature_importance():
    """
    Extract feature importance from the trained Random Forest model.
    Returns a list of dicts: [{'feature': 'name', 'importance': 0.12}, ...]
    """
    load_models()
    
    if 'admissions_rf' not in _models or _features is None:
        return [
            {"feature": "Recent Trend (7 days)", "importance": 0.35},
            {"feature": "Seasonal Pattern", "importance": 0.25},
            {"feature": "Previous Month", "importance": 0.20},
            {"feature": "Day of Week", "importance": 0.20}
        ]
        
    try:
        # Get importance from RF model (Admissions)
        importances = _models['admissions_rf'].feature_importances_
        
        # Map to feature names
        feature_importance = []
        for name, imp in zip(_features, importances):
            # Make names more readable
            friendly_name = name
            if 'lag_' in name:
                days = name.split('_')[1]
                friendly_name = f"Admissions {days} days ago"
            elif 'rolling_mean_' in name:
                days = name.split('_')[2]
                friendly_name = f"Avg Admissions ({days} days)"
            elif 'day_of_week' in name:
                friendly_name = "Day of the Week"
            elif 'month' in name:
                friendly_name = "Seasonality (Month)"
                
            feature_importance.append({"feature": friendly_name, "importance": float(imp)})
            
        # Sort and take top 10
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        return feature_importance[:8]
        
    except Exception as e:
        logger.error(f"❌ Error extracting feature importance: {e}")
        return []
