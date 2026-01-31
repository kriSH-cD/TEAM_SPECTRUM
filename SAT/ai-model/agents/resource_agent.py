class ResourceMonitoringAgent:
    def __init__(self):
        pass

    def check_availability(self, hospital_state):
        """
        Analyze hospital capacity.
        Returns detailed availability status.
        """
        icu_total = hospital_state.get('icuBedsTotal', 1)
        icu_occupied = hospital_state.get('icuBedsOccupied', 0)
        icu_available = icu_total - icu_occupied

        ward_total = hospital_state.get('wardBedsTotal', 1)
        ward_occupied = hospital_state.get('wardBedsOccupied', 0)
        ward_available = ward_total - ward_occupied

        staff_load = hospital_state.get('staffLoad', 0)

        # Determine constraints
        constraints = []
        if icu_available <= 0:
            constraints.append("ICU_FULL")
        if ward_available <= 0:
            constraints.append("WARD_FULL")
        if staff_load > 90:
            constraints.append("STAFF_TIRED")

        return {
            "icu_available": icu_available,
            "ward_available": ward_available,
            "staff_load": staff_load,
            "constraints": constraints
        }
