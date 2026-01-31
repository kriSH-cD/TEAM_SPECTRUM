import numpy as np

def run_tft(historical_data, horizon=14):
    """Run Temporal Fusion Transformer
    
    NOTE: This uses a simple statistical model as a placeholder.
    For production, train actual TFT using NeuralForecast.
    
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
        
        # Exponential weighted moving average with seasonality
        alpha = 0.3
        beta = 0.1  # Seasonal component
        
        # Calculate EWMA
        ewma = [historical_data[0]]
        for i in range(1, len(historical_data)):
            val = alpha * historical_data[i] + (1 - alpha) * ewma[-1]
            ewma.append(val)
        
        # Detect weekly seasonality if enough data
        if len(historical_data) >= 14:
            weekly_pattern = []
            for i in range(7):
                # Average values at same day of week
                same_day = historical_data[i::7]
                weekly_pattern.append(np.mean(same_day))
            weekly_pattern = np.array(weekly_pattern)
            weekly_pattern = weekly_pattern - np.mean(weekly_pattern)  # Center
        else:
            weekly_pattern = np.zeros(7)
        
        # Forecast
        last_ewma = ewma[-1]
        forecast = []
        
        for i in range(horizon):
            # Base forecast from EWMA
            base = last_ewma
            
            # Add seasonal component
            seasonal = weekly_pattern[i % 7]
            
            # Add small noise
            noise = np.random.normal(0, np.std(historical_data) * 0.08)
            
            val = base + beta * seasonal + noise
            forecast.append(max(0, val))
            
        return forecast
        
    except Exception as e:
        print(f"TFT error: {e}")
        mean_val = np.mean(historical_data)
        std_val = np.std(historical_data)
        return [mean_val + np.random.normal(0, std_val * 0.1) for _ in range(horizon)]

if __name__ == '__main__':
    # Test
    test_data = np.array([100, 95, 102, 98, 105, 100, 108, 103,
                          110, 105, 112, 108, 115, 110])
    forecast = run_tft(test_data, horizon=7)
    print(f"TFT forecast: {forecast}")
