import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from huggingface_hub import InferenceClient
import os
# from neuralprophet import NeuralProphet # Uncomment when installed
# from neuralforecast import NeuralForecast # Uncomment when installed
# from neuralforecast.models import PatchTST, TFT # Uncomment when installed

# --- Stage 1: KalmanNet (Noise Cleaning) ---
class KalmanNet:
    def __init__(self, process_variance=1e-5, measurement_variance=1e-1):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.post_estimate = 0.0
        self.post_error_estimate = 1.0

    def update(self, measurement):
        # Prediction step
        prior_estimate = self.post_estimate
        prior_error_estimate = self.post_error_estimate + self.process_variance

        # Update step
        blending_factor = prior_error_estimate / (prior_error_estimate + self.measurement_variance)
        self.post_estimate = prior_estimate + blending_factor * (measurement - prior_estimate)
        self.post_error_estimate = (1 - blending_factor) * prior_error_estimate
        
        return self.post_estimate

    def clean_series(self, series):
        cleaned = []
        for val in series:
            cleaned.append(self.update(val))
        return cleaned

# --- Stage 2: NeuralProphet (Seasonality) ---
def run_neural_prophet(df, horizon=14):
    # Mocking for now to avoid heavy install delay in this step
    # In real impl:
    # m = NeuralProphet()
    # m.fit(df)
    # future = m.make_future_dataframe(df, periods=horizon)
    # forecast = m.predict(future)
    # return forecast
    
    # Mock return
    dates = [datetime.now() + timedelta(days=i) for i in range(horizon)]
    return [{"ds": d, "yhat": 100 + np.sin(i/2)*10} for i, d in enumerate(dates)]

# --- Stage 3, 4, 6: HF Foundation Models ---
def query_hf_model(model_id, input_text, token=None):
    client = InferenceClient(model=model_id, token=token)
    try:
        # Foundation models often take text/json input representing the time series
        # This is a simplified interface
        response = client.text_generation(input_text, max_new_tokens=50)
        return response
    except Exception as e:
        print(f"Error calling {model_id}: {e}")
        return None

# --- Stage 5, 7: NeuralForecast (PatchTST, TFT) ---
def run_neural_forecast(df, models=['PatchTST', 'TFT'], horizon=14):
    # Mocking for speed
    results = {}
    dates = [datetime.now() + timedelta(days=i) for i in range(horizon)]
    for m in models:
        results[m] = [100 + np.random.normal(0, 5) for _ in range(horizon)]
    return results, dates

# --- Stage 8: Ensemble ---
def run_ensemble(forecasts):
    # forecasts: dict of model_name -> list of values
    # Simple weighted average
    final_values = []
    num_steps = len(list(forecasts.values())[0])
    
    weights = {
        'NeuralProphet': 0.1,
        'MOIRAI': 0.2,
        'LagLlama': 0.1,
        'PatchTST': 0.3, # High weight for trend
        'TimesFM': 0.1,
        'TFT': 0.2
    }
    
    for i in range(num_steps):
        weighted_sum = 0
        total_weight = 0
        for model, values in forecasts.items():
            if model in weights:
                weighted_sum += values[i] * weights[model]
                total_weight += weights[model]
        
        if total_weight > 0:
            final_values.append(weighted_sum / total_weight)
        else:
            final_values.append(0)
            
    return final_values

# --- Stage 9: Role-Based Formatter ---
def format_for_role(values, dates, role):
    formatted = []
    for i, (val, date) in enumerate(zip(values, dates)):
        item = {
            "date": date.isoformat(),
            "value": int(val),
            "confidence_lower": int(val * 0.9),
            "confidence_upper": int(val * 1.1)
        }
        
        if role == 'hospital_staff':
            item['metric'] = 'ICU Beds'
            item['action'] = 'Alert Staff' if val < 20 else 'Normal'
        elif role == 'pharmacy':
            item['metric'] = 'Medicine Stock'
            item['action'] = 'Restock' if val < 50 else 'Sufficient'
        elif role == 'admin':
            item['metric'] = 'City Aggregated'
            item['risk_level'] = 'High' if val > 150 else 'Low'
        else: # Public
            item['metric'] = 'Risk Index'
            item['advice'] = 'Wear Mask' if val > 100 else 'Safe'
            
        formatted.append(item)
    return formatted

# --- Main Pipeline Runner ---
def run_full_pipeline(data, role='public', hf_token=None):
    print("--- Starting 9-Step AI Pipeline ---")
    
    # 1. KalmanNet
    print("1. KalmanNet: Cleaning noise...")
    # cleaned_data = KalmanNet().clean_series(data) 
    
    # 2. NeuralProphet
    print("2. NeuralProphet: Decomposing seasonality...")
    np_forecast = run_neural_prophet(None)
    
    # 3. MOIRAI (Mock HF Call)
    print("3. MOIRAI: Zero-shot forecasting...")
    # moirai_res = query_hf_model("Salesforce/moirai-1.0-R-large", str(data), hf_token)
    moirai_vals = [x['yhat'] + 5 for x in np_forecast] # Mock
    
    # 4. Lag-Llama
    print("4. Lag-Llama: Short-term probabilistic...")
    lag_vals = [x['yhat'] - 5 for x in np_forecast] # Mock
    
    # 5. PatchTST
    print("5. PatchTST: Trend correction...")
    nf_res, dates = run_neural_forecast(None, models=['PatchTST', 'TFT'])
    patch_vals = nf_res['PatchTST']
    
    # 6. TimesFM
    print("6. TimesFM: Long-horizon stability...")
    times_vals = [x['yhat'] for x in np_forecast] # Mock
    
    # 7. TFT
    print("7. TFT: Interpretability...")
    tft_vals = nf_res['TFT']
    
    # 8. Ensemble
    print("8. Ensemble: Combining all models...")
    all_forecasts = {
        'NeuralProphet': [x['yhat'] for x in np_forecast],
        'MOIRAI': moirai_vals,
        'LagLlama': lag_vals,
        'PatchTST': patch_vals,
        'TimesFM': times_vals,
        'TFT': tft_vals
    }
    final_values = run_ensemble(all_forecasts)
    
    # 9. Formatter
    print(f"9. Formatting for role: {role}")
    final_output = format_for_role(final_values, dates, role)
    
    return final_output
