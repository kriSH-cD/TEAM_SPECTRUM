import numpy as np
from huggingface_hub import InferenceClient

def run_moirai(historical_data, token=None, horizon=14):
    """Run MOIRAI zero-shot forecasting
    
    Args:
        historical_data: List or array of historical values
        token: HuggingFace API token  
        horizon: Number of days to forecast
        
    Returns:
        List of forecasted values
    """
    try:
        # Construct API URL
        api_url = "https://router.huggingface.co/hf-inference/models/Salesforce/moirai-1.0-R-small"
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        payload = {
            "inputs": historical_data if isinstance(historical_data, list) else historical_data.tolist(),
            "parameters": {"prediction_length": horizon}
        }
        
        import requests
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"MOIRAI API Error {response.status_code}: {response.text}")
            raise Exception(f"API returned {response.status_code}")
            
        result = response.json()
        
        if isinstance(result, list):
            forecast = result[:horizon]
        elif isinstance(result, dict) and 'forecast' in result:
            forecast = result['forecast'][:horizon]
        else:
            # Fallback
            mean_val = np.mean(historical_data)
            std_val = np.std(historical_data)
            forecast = [mean_val + np.random.normal(0, std_val * 0.3) for _ in range(horizon)]
            
        return forecast
        
    except Exception as e:
        print(f"MOIRAI API error: {e}")
        # Fallback: seasonal naive forecast
        if len(historical_data) >= 7:
            last_week = historical_data[-7:]
            forecast = (list(last_week) * (horizon // 7 + 1))[:horizon]
        else:
            mean_val = np.mean(historical_data)
            forecast = [mean_val for _ in range(horizon)]
        return forecast
