from datetime import datetime, timedelta
import os
import numpy as np
import pandas as pd
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Import modules
from data_loader import load_preprocessed_data, extract_admissions_series
from kalman_filter import KalmanNet
from seasonal_decompose import run_seasonal_decompose
from model_chronos import run_chronos
from model_moirai import run_moirai
from model_lagllama import run_lagllama
from model_patchtst import run_patchtst
from model_timesfm import run_timesfm
from model_tft import run_tft
from ensemble import run_ensemble

def generate_hospital_alerts(forecast_values, historical_mean):
    """
    Generate health alerts for hospital staff based on forecast data.
    
    Logic:
    - If icu_demand > threshold → CRITICAL
    - If oxygen_units > oxygen_stock_available * 0.85 → WARNING
    - If admissions > moving_average_14_days * 1.2 → WARNING
    """
    alerts = {
        "alert_level": "NORMAL",
        "reasons": [],
        "recommended_actions": []
    }
    
    # Constants (in a real app, these would come from a database or config)
    ICU_CAPACITY = 50
    OXYGEN_STOCK = 1000
    
    # Calculate metrics based on forecast
    # We use the max value in the forecast horizon for worst-case scenario planning
    max_admissions = max(forecast_values)
    max_icu_demand = int(max_admissions * 0.15)
    max_oxygen_demand = int(max_admissions * 2.5)
    
    # Check ICU Demand
    if max_icu_demand > ICU_CAPACITY:
        alerts["alert_level"] = "CRITICAL"
        alerts["reasons"].append(f"High ICU demand predicted ({max_icu_demand} beds needed vs {ICU_CAPACITY} available)")
        alerts["recommended_actions"].append("Activate surge capacity protocols immediately")
        alerts["recommended_actions"].append("Postpone elective surgeries to free up beds")
    elif max_icu_demand > ICU_CAPACITY * 0.85:
        if alerts["alert_level"] != "CRITICAL":
            alerts["alert_level"] = "WARNING"
        alerts["reasons"].append(f"ICU capacity nearing saturation ({max_icu_demand}/{ICU_CAPACITY} beds)")
        alerts["recommended_actions"].append("Review ICU discharge candidates")

    # Check Oxygen Supply
    if max_oxygen_demand > OXYGEN_STOCK * 0.85:
        if alerts["alert_level"] != "CRITICAL":
            alerts["alert_level"] = "WARNING"
        alerts["reasons"].append(f"Oxygen supply risk: Demand ({max_oxygen_demand} units) > 85% of stock")
        alerts["recommended_actions"].append("Order emergency oxygen resupply")
        alerts["recommended_actions"].append("Check oxygen plant efficiency")

    # Check Admission Trends (Surge Detection)
    if max_admissions > historical_mean * 1.2:
        if alerts["alert_level"] == "NORMAL":
            alerts["alert_level"] = "WARNING"
        alerts["reasons"].append(f"Projected admission surge (+{int((max_admissions/historical_mean - 1)*100)}% vs average)")
        alerts["recommended_actions"].append("Increase staffing for upcoming shifts")
        alerts["recommended_actions"].append("Alert triage teams of expected high volume")
        
    if alerts["alert_level"] == "NORMAL":
        alerts["reasons"].append("All metrics within safe operational limits")
        alerts["recommended_actions"].append("Continue standard monitoring protocols")
        
    return alerts

def format_for_role(values, dates, role, historical_mean=100, custom_forecasts=None):
    """Format forecast output based on user role"""
    # Get real feature importance if available
    explanations = [
        {"feature": "Historical Trend", "importance": 0.35},
        {"feature": "Seasonal Pattern", "importance": 0.25},
        {"feature": "Recent Changes", "importance": 0.20},
        {"feature": "External Factors", "importance": 0.20}
    ]
    
    try:
        from model_trained import get_feature_importance
        real_explanations = get_feature_importance()
        if real_explanations:
            explanations = real_explanations
    except Exception as e:
        logger.warning(f"⚠️ Could not get real feature importance: {e}")

    formatted = {
        "forecast": [],
        "explanations": explanations,
        "ensemble_confidence": 0.87,
        "models_used": ["Chronos", "Lag-Llama", "MOIRAI", "TimesFM", "PatchTST", "TFT"]
    }
    
    # Generate hospital-specific alerts if applicable
    if role == 'hospital_staff':
        formatted["hospital_alerts"] = generate_hospital_alerts(values, historical_mean)
    
    for i, (val, date) in enumerate(zip(values, dates)):
        val = max(0, val)  # Ensure non-negative
        item = {
            "date": date.isoformat() if hasattr(date, 'isoformat') else str(date),
            "value": int(val),
            "confidence_lower": int(val * 0.85),
            "confidence_upper": int(val * 1.15)
        }
        
        if role == 'hospital_staff':
            item['metric'] = 'Patient Admissions'
            
            # Use custom multi-target forecasts if available, otherwise fallback to heuristics
            if custom_forecasts and i < len(custom_forecasts['icu']):
                item['icu_demand'] = int(custom_forecasts['icu'][i])
                item['oxygen_units'] = int(custom_forecasts['oxygen'][i])
            else:
                item['icu_demand'] = int(val * 0.15)  # Fallback
                item['oxygen_units'] = int(val * 2.5) # Fallback
                
            item['staff_needed'] = int(val / 8)  # 1 staff per 8 patients
            item['alert'] = 'HIGH' if val > np.mean(values) * 1.2 else 'NORMAL'
            
        elif role == 'pharmacy':
            item['metric'] = 'Medicine Demand Index'
            item['paracetamol_units'] = int(val * 3)
            item['antibiotics_units'] = int(val * 1.5)
            item['mask_demand'] = int(val * 5)
            item['alert'] = 'RESTOCK' if val > np.mean(values) * 1.15 else 'SUFFICIENT'
            
        elif role == 'admin':
            item['metric'] = 'Regional Health Index'
            item['risk_level'] = 'HIGH' if val > np.mean(values) * 1.3 else 'MODERATE' if val > np.mean(values) else 'LOW'
            item['hotspot_probability'] = min(100, int((val / np.mean(values)) * 50))
            item['action_required'] = bool(val > np.mean(values) * 1.25)
            
        else:  # Public
            item['metric'] = 'Community Health Risk'
            item['advice'] = 'High Alert - Avoid Crowds' if val > np.mean(values) * 1.2 else 'Maintain Precautions' if val > np.mean(values) else 'Low Risk'
            item['mask_recommendation'] = bool(val > np.mean(values))
            item['safety_score'] = max(0, min(100, int(100 - (val / np.mean(values)) * 50)))
            
        formatted["forecast"].append(item)
    
    return formatted

def generate_fallback_values(horizon):
    """Generate simple fallback forecast when models fail"""
    base = 120
    return [base + i * 0.3 + np.random.normal(0, 3) for i in range(horizon)]

def run_predict_pipeline(role='public', hf_token=None, horizon=14):
    """Run full multi-model forecasting pipeline with comprehensive error handling"""
    
    logger.info("=" * 60)
    logger.info("🚀 Multi-Model Forecasting Pipeline Started")
    logger.info(f"📊 Role: {role}, Horizon: {horizon} days")
    logger.info("=" * 60)
    
    models_used = []
    failed_models = []
    historical_mean = 100 # Default
    
    # Load real data
    logger.info("📂 Loading raw data from CSV...")
    try:
        # Use absolute path to data
        data_path = os.path.join(os.path.dirname(__file__), '../data/MASTER_DF1.csv')
        if not os.path.exists(data_path):
             # Fallback to MASTER_DF.csv if DF1 not found
             data_path = os.path.join(os.path.dirname(__file__), '../data/MASTER_DF.csv')
        
        df = pd.read_csv(data_path)
        
        # Ensure date is datetime and sorted
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
        # Get last 90 days of admissions (or target column)
        # Assuming 'new_admissions' is the target, or 'value'
        target_col = 'new_admissions' if 'new_admissions' in df.columns else 'value'
        
        if target_col in df.columns:
            historical_data = df[target_col].tail(90).tolist()
            historical_mean = np.mean(historical_data)
            logger.info(f"✅ Loaded {len(historical_data)} days of raw data (mean: {historical_mean:.1f})")
        else:
            raise ValueError(f"Target column {target_col} not found")
            
    except Exception as e:
        logger.warning(f"⚠️  Could not load real data ({type(e).__name__}: {e}), using synthetic data", exc_info=True)
        historical_data = [100 + i * 0.5 + np.random.normal(0, 5) for i in range(90)]
        historical_mean = np.mean(historical_data)
    
    # Step 1: Kalman Filter (Noise Reduction) - with error handling
    logger.info("🔧 Step 1: KalmanNet - Noise Reduction")
    try:
        kalman = KalmanNet()
        cleaned_data = kalman.clean_series(historical_data)
        logger.info("   ✅ Kalman filtering complete")
    except Exception as e:
        logger.error(f"   ❌ Kalman filter failed: {e}")
        cleaned_data = historical_data  # Use raw data as fallback
        logger.warning("   ⚠️  Using raw data without Kalman filtering")
    
    # Step 2: Seasonal Decomposition
    logger.info("🔧 Step 2: Seasonal Decomposition")
    try:
        seasonal_forecast = run_seasonal_decompose(None, horizon=horizon)
        dates = [datetime.now() + timedelta(days=i+1) for i in range(horizon)]
        logger.info("   ✅ Seasonal pattern extracted")
    except Exception as e:
        logger.error(f"   ❌ Seasonal decomposition failed: {e}")
        dates = [datetime.now() + timedelta(days=i+1) for i in range(horizon)]
    
    # Initialize forecast storage
    all_forecasts = {}
    
    # Step 3: Chronos - with error handling
    logger.info("🤖 Step 3: Chronos (Amazon)")
    try:
        chronos_vals = run_chronos(cleaned_data, token=hf_token, horizon=horizon)
        all_forecasts['Chronos'] = chronos_vals
        models_used.append('Chronos')
        logger.info("   ✅ Chronos complete")
    except Exception as e:
        logger.error(f"   ❌ Chronos failed: {e}")
        failed_models.append('Chronos')
    
    # Step 4: MOIRAI - with error handling
    logger.info("🤖 Step 4: MOIRAI (Salesforce)")
    try:
        moirai_vals = run_moirai(cleaned_data, token=hf_token, horizon=horizon)
        all_forecasts['MOIRAI'] = moirai_vals
        models_used.append('MOIRAI')
        logger.info("   ✅ MOIRAI complete")
    except Exception as e:
        logger.error(f"   ❌ MOIRAI failed: {e}")
        failed_models.append('MOIRAI')
    
    # Step 5: Lag-Llama - with error handling
    logger.info("🤖 Step 5: Lag-Llama")
    try:
        lag_vals = run_lagllama(cleaned_data, token=hf_token, horizon=horizon)
        all_forecasts['LagLlama'] = lag_vals
        models_used.append('Lag-Llama')
        logger.info("   ✅ Lag-Llama complete")
    except Exception as e:
        logger.error(f"   ❌ Lag-Llama failed: {e}")
        failed_models.append('Lag-Llama')
    
    # Step 6: TimesFM - with error handling
    logger.info("🤖 Step 6: TimesFM (Google)")
    try:
        times_vals = run_timesfm(cleaned_data, token=hf_token, horizon=horizon)
        all_forecasts['TimesFM'] = times_vals
        models_used.append('TimesFM')
        logger.info("   ✅ TimesFM complete")
    except Exception as e:
        logger.error(f"   ❌ TimesFM failed: {e}")
        failed_models.append('TimesFM')
    
    # Step 7: PatchTST - with error handling
    logger.info("🤖 Step 7: PatchTST")
    try:
        patch_vals = run_patchtst(cleaned_data, horizon=horizon)
        all_forecasts['PatchTST'] = patch_vals
        models_used.append('PatchTST')
        logger.info("   ✅ PatchTST complete")
    except Exception as e:
        logger.error(f"   ❌ PatchTST failed: {e}")
        failed_models.append('PatchTST')
    
    # Step 8: TFT - with error handling
    logger.info("🤖 Step 8: TFT")
    try:
        tft_vals = run_tft(cleaned_data, horizon=horizon)
        all_forecasts['TFT'] = tft_vals
        models_used.append('TFT')
        logger.info("   ✅ TFT complete")
    except Exception as e:
        logger.error(f"   ❌ TFT failed: {e}")
        failed_models.append('TFT')

    # Step 8.5: Custom Trained Model (Random Forest) - Multi-Target
    logger.info("🤖 Step 8.5: Custom Trained Model (Multi-Target)")
    custom_forecasts = None
    try:
        from model_trained import run_trained_model
        custom_forecasts = run_trained_model(cleaned_data, horizon=horizon)
        # We'll use the 'admissions' part for the main ensemble
        all_forecasts['CustomTrained'] = custom_forecasts['admissions']
        models_used.append('CustomTrained')
        logger.info("   ✅ Custom Trained Model complete")
    except Exception as e:
        logger.error(f"   ❌ Custom Trained Model failed: {e}")
        failed_models.append('CustomTrained')
    
    # Log model success summary
    logger.info(f"📊 Model Summary: {len(models_used)} successful, {len(failed_models)} failed")
    if failed_models:
        logger.warning(f"⚠️  Failed models: {', '.join(failed_models)}")
    
    # Step 9: Ensemble - Combining predictions
    logger.info("🔄 Step 9: Ensemble - Combining predictions")
    try:
        if len(all_forecasts) == 0:
            # All models failed - use fallback
            logger.error("❌ All models failed! Using fallback prediction")
            final_values = generate_fallback_values(horizon)
            models_used = ['Fallback Statistical Model']
            ensemble_confidence = 0.50
        else:
            final_values = run_ensemble(all_forecasts)
            # Adjust confidence based on number of successful models
            ensemble_confidence = 0.65 + (len(models_used) / 6) * 0.25
            logger.info(f"   ✅ Ensemble complete (mean: {np.mean(final_values):.1f})")
            logger.info(f"   📈 Ensemble confidence: {ensemble_confidence:.2%}")
    except Exception as e:
        logger.error(f"   ❌ Ensemble failed: {e}")
        final_values = generate_fallback_values(horizon)
        models_used = ['Fallback Statistical Model']
        ensemble_confidence = 0.50
    
    # Step 10: Format for role
    logger.info(f"🎨 Step 10: Formatting for role={role}")
    try:
        # Pass custom_forecasts to formatting if available
        final_output = format_for_role(final_values, dates, role, historical_mean, custom_forecasts)
        final_output['models_used'] = models_used
        final_output['ensemble_confidence'] = ensemble_confidence
        
        if failed_models:
            final_output['warnings'] = f"Some models failed: {', '.join(failed_models)}"
        
        logger.info("   ✅ Forecast ready")
    except Exception as e:
        logger.error(f"   ❌ Formatting failed: {e}")
        raise  # Re-raise to trigger fallback in ai_service.py
    
    logger.info("=" * 60)
    logger.info("✅ Pipeline Complete!")
    logger.info("=" * 60)
    
    return final_output

if __name__ == '__main__':
    # Test pipeline
    logging.basicConfig(level=logging.INFO)
    result = run_predict_pipeline(role='hospital_staff', horizon=7)
    print(f"\nSample output: {result['forecast'][0]}")
