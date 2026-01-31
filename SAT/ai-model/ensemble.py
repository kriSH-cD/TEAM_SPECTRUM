def run_ensemble(forecasts):
    """
    Combines forecasts from multiple models using weighted averaging.
    forecasts: dict of model_name -> list of values
    """
    final_values = []
    if not forecasts:
        return []
        
    num_steps = len(list(forecasts.values())[0])
    
    weights = {
        'CustomTrained': 0.3,
        'PatchTST': 0.2,
        'MOIRAI': 0.15,
        'TFT': 0.15,
        'TimesFM': 0.1,
        'LagLlama': 0.05,
        'NeuralProphet': 0.05
    }
    
    for i in range(num_steps):
        weighted_sum = 0
        total_weight = 0
        for model, values in forecasts.items():
            if model in weights and i < len(values):
                weighted_sum += values[i] * weights[model]
                total_weight += weights[model]
        
        if total_weight > 0:
            final_values.append(weighted_sum / total_weight)
        else:
            final_values.append(0)
            
    return final_values
