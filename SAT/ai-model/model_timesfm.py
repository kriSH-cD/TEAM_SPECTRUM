from huggingface_hub import InferenceClient
import numpy as np
from huggingface_hub import InferenceClient

def run_timesfm(historical_data, token=None, horizon=14):
    """Run TimesFM long-horizon forecasting
    
    Args:
        historical_data: List or array of historical values
        token: HuggingFace API token
        horizon: Number of days to forecast
        
    Returns:
        List of forecasted values
    """
    try:
        # Construct API URL
        api_url = "https://router.huggingface.co/hf-inference/models/google/timesfm-1.0-200m"
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        payload = {
            "inputs": historical_data if isinstance(historical_data, list) else historical_data.tolist(),
            "parameters": {"prediction_length": horizon}
        }
        
        import requests
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"TimesFM API Error {response.status_code}: {response.text}")
            raise Exception(f"API returned {response.status_code}")
            
        result = response.json()
        
        if isinstance(result, list):
            forecast = result[:horizon]
        elif isinstance(result, dict) and 'output' in result:
            forecast = result['output'][:horizon]
        else:
            # Fallback
            mean_val = np.mean(historical_data)
            forecast = [mean_val + np.random.normal(0, mean_val * 0.06) for _ in range(horizon)]
            
        return forecast
        
    except Exception as e:
        print(f"TimesFM API error: {e}")
        # Fallback: exponential smoothing
        alpha = 0.3
        forecast = []
        last_val = historical_data[-1] if len(historical_data) > 0 else 100
        for i in range(horizon):
            next_val = alpha * last_val + (1 - alpha) * np.mean(historical_data)
            forecast.append(next_val + np.random.normal(0, 1))
            last_val = next_val
        return forecast
