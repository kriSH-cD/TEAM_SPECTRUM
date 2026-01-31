export interface Hospital {
    id: string
    name: string
    location: string
    totalBeds: number
    availableBeds: number
    icuBeds: number
    availableIcuBeds: number
    occupancyRate: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface Prediction {
    id: string
    type: 'beds' | 'icu' | 'staff' | 'medicine'
    title: string
    currentValue: number
    predictedValue: number
    changePercentage: number
    date: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    description: string
}

export interface Alert {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'danger' | 'success'
    timestamp: string
    read: boolean
    hospitalId?: string
}

export interface ChartDataPoint {
    date: string
    actual?: number
    predicted?: number
    [key: string]: any
}

export interface DashboardStats {
    totalHospitals: number
    totalBeds: number
    availableBeds: number
    criticalAlerts: number
    occupancyRate: number
}
