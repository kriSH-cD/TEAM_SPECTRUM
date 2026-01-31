import numpy as np
from datetime import datetime, timedelta
# from neuralprophet import NeuralProphet # Uncomment when installed

def run_seasonal_decompose(df, horizon=14):
    """
    Decomposes seasonality using NeuralProphet.
    Returns a list of dictionaries with 'ds' and 'yhat'.
    """
    # Mocking for now to avoid heavy install delay/runtime overhead in demo
    # In real impl:
    # m = NeuralProphet()
    # m.fit(df)
    # future = m.make_future_dataframe(df, periods=horizon)
    # forecast = m.predict(future)
    # return forecast
    
    # Mock return
    dates = [datetime.now() + timedelta(days=i) for i in range(horizon)]
    # Simulate seasonality with sine wave
    return [{"ds": d, "yhat": 100 + np.sin(i/2)*10} for i, d in enumerate(dates)]
