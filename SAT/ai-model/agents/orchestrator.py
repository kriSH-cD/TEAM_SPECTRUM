from .risk_agent import RiskAssessmentAgent
from .resource_agent import ResourceMonitoringAgent
# Policy is simple enough to embed or separate, embedding for simplicity first

class DecisionOrchestrator:
    def __init__(self):
        self.risk_agent = RiskAssessmentAgent()
        self.resource_agent = ResourceMonitoringAgent()

    def decide(self, patient_data, hospital_state):
        """
        Main Decision Logic:
        Combines Risk + Resource + Policy
        """
        name = patient_data.get('name', 'Patient')
        status = patient_data.get('status', 'WAITING')
        vitals = patient_data.get('currentVitals', {})
        
        # 1. Get Risk Assessment
        risk_analysis = self.risk_agent.evaluate(vitals)
        risk_level = risk_analysis['level']
        
        # 2. Get Resource Status
        resources = self.resource_agent.check_availability(hospital_state)
        icu_open = resources['icu_available'] > 0
        ward_open = resources['ward_available'] > 0
        staff_overload = resources['staff_load'] > 80

        # 3. Policy Engine & Orchestration Logic
        action = "NORMAL_OBSERVATION"
        reason = "Stable condition."
        
        # LOGIC MATRIX
        if risk_level == "CRITICAL":
            if icu_open:
                action = "ESCALATE_TO_ICU"
                reason = f"Critical risk ({risk_analysis['score']}). ICU bed available."
            elif ward_open:
                action = "ESCALATE_TO_WARD" # Stepdown since ICU full
                reason = f"Critical risk, but ICU FULL. Stabilize in Ward."
            else:
                action = "EXTERNAL_TRANSFER"
                reason = "Critical risk. ALL BEDS FULL. Require transfer."
        
        elif risk_level == "HIGH":
            if icu_open:
                action = "ESCALATE_TO_ICU"
                reason = "High deteriorating risk. Pre-emptive ICU admission."
            else:
                action = "INCREASE_MONITORING"
                reason = "High risk. ICU full. Increase monitoring frequency."
        
        elif risk_level == "MODERATE":
            if staff_overload:
                action = "DELAY_TREATMENT"
                reason = "Moderate risk but staff overloaded. Monitor remotely."
            else:
                action = "INCREASE_MONITORING"
                reason = "Moderate risk. Watch closely."
        
        elif risk_level == "LOW":
            if status == "ICU":
                action = "STEP_DOWN_TO_WARD"
                reason = "Patient stable. Step down from ICU."
            elif status == "WARD":
                action = "RECOMMEND_DISCHARGE"
                reason = "Patient stable. Eligible for discharge."
            elif staff_overload:
                 action = "DELAY_PROCEDURES"
                 reason = "Low risk. Defer to prioritize critical patients."

        return {
            "patient_name": name,
            "input_vitals": vitals,
            "risk_analysis": risk_analysis,
            "resource_status": resources,
            "decision": {
                "action": action,
                "reason": reason,
                "priority_score": risk_analysis['score'] # Simplified priority
            }
        }
