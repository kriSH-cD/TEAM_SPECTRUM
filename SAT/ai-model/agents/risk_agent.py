import numpy as np

class RiskAssessmentAgent:
    def __init__(self):
        pass

    def evaluate(self, vitals):
        """
        Evaluate patient risk based on vitals.
        Returns: risk_score (0-100), risk_level, trend
        """
        score = 0
        reasons = []

        # Simple Rule-Based Scoring (NEWS-2 style)
        # Oxygen Saturation (SpO2)
        if vitals.get('spO2', 100) < 92:
            score += 30
            reasons.append("Critical SpO2 (<92%)")
        elif vitals.get('spO2', 100) < 95:
            score += 15
            reasons.append("Low SpO2 (<95%)")

        # Heart Rate
        hr = vitals.get('heartRate', 80)
        if hr > 130 or hr < 40:
            score += 25
            reasons.append(f"Abnormal HR ({hr})")
        elif hr > 110:
            score += 10
            reasons.append("Tachycardia")

        # Systolic BP
        bp_sys = vitals.get('bpSystolic', 120)
        if bp_sys < 90:
            score += 25
            reasons.append(f"Hypotension ({bp_sys})")
        
        # Respiratory Rate
        rr = vitals.get('respiratoryRate', 16)
        if rr > 25:
            score += 20
            reasons.append(f"Tachypnea ({rr})")

        # Risk Classification
        if score >= 70:
            level = "CRITICAL"
        elif score >= 40:
            level = "HIGH"
        elif score >= 20:
            level = "MODERATE"
        else:
            level = "LOW"

        return {
            "score": min(score, 100),
            "level": level,
            "reasons": reasons
        }
