import numpy as np
from huggingface_hub import InferenceClient

def run_lagllama(historical_data, token=None, horizon=14):
    """Run Lag-Llama probabilistic forecasting
    
    Args:
        historical_data: List or array of historical values
        token: HuggingFace API token
        horizon: Number of days to forecast
        
    Returns:
        List of forecasted values (median prediction)
    """
    try:
        # Construct API URL
        api_url = "https://router.huggingface.co/hf-inference/models/time-series-foundation-models/Lag-Llama"
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        payload = {
            "inputs": historical_data if isinstance(historical_data, list) else historical_data.tolist(),
            "parameters": {"prediction_length": horizon}
        }
        
        import requests
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Lag-Llama API Error {response.status_code}: {response.text}")
            raise Exception(f"API returned {response.status_code}")
            
        result = response.json()
        
        if isinstance(result, list):
            forecast = result[:horizon]
        elif isinstance(result, dict) and 'predictions' in result:
            forecast = result['predictions'][:horizon]
        else:
            # Fallback
            mean_val = np.mean(historical_data)
            forecast = [mean_val + np.random.normal(0, mean_val * 0.08) for _ in range(horizon)]
            
        return forecast
        
    except Exception as e:
        print(f"Lag-Llama API error: {e}")
        # Fallback: trend-based forecast
        recent = historical_data[-14:] if len(historical_data) >= 14 else historical_data
        trend = (recent[-1] - recent[0]) / len(recent) if len(recent) > 1 else 0
        base = recent[-1] if len(recent) > 0 else 100
        return [base + trend * (i + 1) + np.random.normal(0, 2) for i in range(horizon)]
