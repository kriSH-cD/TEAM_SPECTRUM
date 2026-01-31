import numpy as np

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
        # Initialize with first value if available
        if len(series) > 0:
            self.post_estimate = series[0]
            
        for val in series:
            cleaned.append(self.update(val))
        return cleaned
