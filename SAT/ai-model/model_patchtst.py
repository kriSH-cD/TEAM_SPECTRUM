import numpy as np

def run_patchtst(historical_data, horizon=14):
    """Run PatchTST trend correction
    
    NOTE: This uses a simple statistical model as a placeholder.
    For production, train actual PatchTST using NeuralForecast.
    
    Args:
        historical_data: List or array of historical values
        horizon: Number of days to forecast
        
    Returns:
        List of forecasted values
    """
    try:
        # Convert to numpy
        if not isinstance(historical_data, np.ndarray):
            historical_data = np.array(historical_data)
        
        # Simple trend + seasonal decomposition
        # Trend: linear regression on last 30 days
        recent = historical_data[-30:] if len(historical_data) >= 30 else historical_data
        
        if len(recent) >= 2:
            x = np.arange(len(recent))
            # Simple linear fit
            slope = (recent[-1] - recent[0]) / len(recent)
            intercept = recent[-1]
            
            # Project forward
            forecast = []
            for i in range(horizon):
                trend_val = intercept + slope * (i + 1)
                # Add small noise
                val = trend_val + np.random.normal(0, np.std(recent) * 0.1)
                forecast.append(max(0, val))  # Ensure non-negative
        else:
            # Fallback
            mean_val = np.mean(historical_data)
            forecast = [mean_val for _ in range(horizon)]
            
        return forecast
        
    except Exception as e:
        print(f"PatchTST error: {e}")
        mean_val = np.mean(historical_data)
        return [mean_val for _ in range(horizon)]

if __name__ == '__main__':
    # Test
    test_data = np.array([100, 102, 105, 108, 110, 112, 115, 118])
    forecast = run_patchtst(test_data, horizon=7)
    print(f"PatchTST forecast: {forecast}")
