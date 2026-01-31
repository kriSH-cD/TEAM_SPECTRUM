import pickle
import numpy as np
import os

def load_preprocessed_data(split='train'):
    """Load preprocessed data from pkl files"""
    data_path = os.path.join(os.path.dirname(__file__), '../data', f'processed_{split}.pkl')
    
    with open(data_path, 'rb') as f:
        data = pickle.load(f)
    
    return data

def extract_admissions_series(data, num_samples=10):
    """Extract hospital admissions time series from preprocessed data
    
    Args:
        data: Dict with 'encoder_input', 'target', etc.
        num_samples: Number of sequences to extract
        
    Returns:
        List of time series arrays (each is 90 days context)
    """
    encoder_input = data['encoder_input']  # Shape: (N, 90, 63)
    
    # Feature 0 is typically total_patient_admissions
    # Extract first feature across context window
    series_list = []
    
    for i in range(min(num_samples, len(encoder_input))):
        # Get the first feature (admissions) across 90 days
        series = encoder_input[i, :, 0]  # Shape: (90,)
        series_list.append(series)
    
    return series_list

def prepare_forecast_input(historical_data, horizon=14):
    """Prepare input format for forecasting models
    
    Args:
        historical_data: numpy array of shape (context_length,)
        horizon: forecast horizon in days
        
    Returns:
        Dict with formatted input
    """
    return {
        'values': historical_data.tolist(),
        'horizon': horizon,
        'context_length': len(historical_data)
    }

if __name__ == '__main__':
    # Test loading
    train_data = load_preprocessed_data('train')
    print(f"Train data shape: {train_data['encoder_input'].shape}")
    
    series = extract_admissions_series(train_data, num_samples=5)
    print(f"Extracted {len(series)} series")
    print(f"First series shape: {series[0].shape}")
    print(f"First series sample: {series[0][:10]}")
