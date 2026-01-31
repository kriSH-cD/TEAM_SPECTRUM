export interface Vitals {
    heartRate: number;
    bpSystolic: number;
    bpDiastolic: number;
    spO2: number;
    temperature: number;
    respiratoryRate: number;
    timestamp: string;
}

export interface AgentAction {
    timestamp: string;
    action: string;
    reason: string;
    agent: string;
}


export interface Patient {
    _id: string;
    name: string;
    age: number;
    gender: string;
    chiefComplaint: string;
    status: 'WAITING' | 'ER' | 'ICU' | 'WARD' | 'DISCHARGED';
    riskScore: number;
    acuityTrend: 'STABLE' | 'IMPROVING' | 'DETERIORATING';
    currentVitals: Vitals;
    actionsHistory: AgentAction[];
}
