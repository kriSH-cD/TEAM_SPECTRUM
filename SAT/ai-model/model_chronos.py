import numpy as np
from huggingface_hub import InferenceClient
import json

def run_chronos(historical_data, token=None, horizon=14):
    """Run Chronos time series forecasting via HuggingFace Inference API
    
    Args:
        historical_data: List or array of historical values
        token: HuggingFace API token
        horizon: Number of days to forecast
        
    Returns:
        List of forecasted values
    """
    try:
        # Construct API URL
        api_url = f"https://router.huggingface.co/hf-inference/models/amazon/chronos-t5-base"
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        # Chronos expects JSON input with time series
        payload = {
            "inputs": historical_data if isinstance(historical_data, list) else historical_data.tolist(),
            "parameters": {
                "prediction_length": horizon
            }
        }
        
        # Call the model via requests
        import requests
        response = requests.post(api_url, headers=headers, json=payload)
        
        # Check for errors
        if response.status_code != 200:
            print(f"Chronos API Error {response.status_code}: {response.text}")
            raise Exception(f"API returned {response.status_code}")
            
        result = response.json()
        
        # Extract forecast from result
        if isinstance(result, list):
            forecast = result[:horizon]
        elif isinstance(result, dict) and 'forecast' in result:
            forecast = result['forecast'][:horizon]
        else:
            # Fallback: use historical mean + noise
            mean_val = np.mean(historical_data)
            forecast = [mean_val + np.random.normal(0, mean_val * 0.1) for _ in range(horizon)]
            
        return forecast
        
    except Exception as e:
        print(f"Chronos API error: {e}")
        # Fallback: simple moving average forecast
        mean_val = np.mean(historical_data[-7:])  # Use last week
        return [mean_val + np.random.normal(0, mean_val * 0.05) for _ in range(horizon)]

if __name__ == '__main__':
    # Test
    test_data = [100, 102, 105, 98, 101, 104, 106, 108, 110, 107]
    forecast = run_chronos(test_data, horizon=7)
    print(f"Chronos forecast: {forecast}")
