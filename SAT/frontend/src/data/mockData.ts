import type { Hospital, Prediction, Alert, ChartDataPoint } from '../types'

// Mock data for hospitals with more realistic distribution
export const mockHospitals: Hospital[] = [
    {
        id: '1',
        name: 'City General Hospital',
        location: 'Mumbai Central',
        totalBeds: 500,
        availableBeds: 85,
        icuBeds: 50,
        availableIcuBeds: 5,
        occupancyRate: 83,
        riskLevel: 'high'
    },
    {
        id: '2',
        name: 'St. Mary Medical Center',
        location: 'Andheri West',
        totalBeds: 350,
        availableBeds: 120,
        icuBeds: 40,
        availableIcuBeds: 12,
        occupancyRate: 66,
        riskLevel: 'medium'
    },
    {
        id: '3',
        name: 'Apollo Hospital',
        location: 'Bandra',
        totalBeds: 600,
        availableBeds: 45,
        icuBeds: 60,
        availableIcuBeds: 3,
        occupancyRate: 92,
        riskLevel: 'critical'
    },
    {
        id: '4',
        name: 'Fortis Healthcare',
        location: 'Powai',
        totalBeds: 400,
        availableBeds: 180,
        icuBeds: 45,
        availableIcuBeds: 18,
        occupancyRate: 55,
        riskLevel: 'low'
    },
    {
        id: '5',
        name: 'Lilavati Hospital',
        location: 'Bandra West',
        totalBeds: 450,
        availableBeds: 95,
        icuBeds: 55,
        availableIcuBeds: 8,
        occupancyRate: 79,
        riskLevel: 'high'
    },
    {
        id: '6',
        name: 'Kokilaben Dhirubhai Ambani Hospital',
        location: 'Andheri',
        totalBeds: 550,
        availableBeds: 165,
        icuBeds: 65,
        availableIcuBeds: 22,
        occupancyRate: 70,
        riskLevel: 'medium'
    }
]

// Mock data for predictions with better variance
export const mockPredictions: Prediction[] = [
    {
        id: '1',
        type: 'icu',
        title: 'ICU Bed Demand Surge',
        currentValue: 340,
        predictedValue: 425,
        changePercentage: 25,
        date: '2025-12-03',
        riskLevel: 'high',
        description: 'Expected 25% increase in ICU bed demand due to seasonal flu outbreak and pollution spike'
    },
    {
        id: '2',
        type: 'staff',
        title: 'Nursing Staff Shortage',
        currentValue: 1200,
        predictedValue: 1416,
        changePercentage: 18,
        date: '2025-12-05',
        riskLevel: 'medium',
        description: 'Predicted 18% increase in nurse requirement for emergency departments'
    },
    {
        id: '3',
        type: 'medicine',
        title: 'Oxygen Supply Critical',
        currentValue: 5000,
        predictedValue: 7000,
        changePercentage: 40,
        date: '2025-12-01',
        riskLevel: 'critical',
        description: 'Oxygen cylinder usage expected to rise by 40% in next 10 days'
    },
    {
        id: '4',
        type: 'beds',
        title: 'General Bed Occupancy',
        currentValue: 2850,
        predictedValue: 3135,
        changePercentage: 10,
        date: '2025-12-07',
        riskLevel: 'low',
        description: 'Moderate increase in general bed demand expected'
    },
    {
        id: '5',
        type: 'medicine',
        title: 'Antibiotic Demand Increase',
        currentValue: 8500,
        predictedValue: 10200,
        changePercentage: 20,
        date: '2025-12-04',
        riskLevel: 'medium',
        description: 'Seasonal infections driving up antibiotic requirements'
    },
    {
        id: '6',
        type: 'staff',
        title: 'Emergency Department Capacity',
        currentValue: 450,
        predictedValue: 585,
        changePercentage: 30,
        date: '2025-12-02',
        riskLevel: 'high',
        description: 'Emergency visits expected to surge during festival season'
    }
]

// Mock data for alerts
export const mockAlerts: Alert[] = [
    {
        id: '1',
        title: 'Critical ICU Shortage Alert',
        message: 'Apollo Hospital ICU capacity at 95%. Immediate action required.',
        type: 'danger',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: false,
        hospitalId: '3'
    },
    {
        id: '2',
        title: 'Pollution Spike Detected',
        message: 'AQI levels rising. Expect 30% increase in respiratory patients in next 48 hours.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false
    },
    {
        id: '3',
        title: 'Festival Season Alert',
        message: 'Diwali week approaching. Prepare for increased emergency cases.',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: true
    },
    {
        id: '4',
        title: 'Staff Allocation Success',
        message: 'Additional nursing staff successfully allocated to City General Hospital.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true
    },
    {
        id: '5',
        title: 'Ventilator Shortage Warning',
        message: 'Lilavati Hospital ventilator availability down to 15%. Monitor closely.',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        hospitalId: '5'
    },
    {
        id: '6',
        title: 'Medicine Stock Replenished',
        message: 'Critical medicine inventory restocked at St. Mary Medical Center.',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        read: true,
        hospitalId: '2'
    }
]

// Enhanced chart data with realistic patterns and noise
export const mockChartData: ChartDataPoint[] = [
    { date: '2025-11-20', actual: 280, predicted: 278 },
    { date: '2025-11-21', actual: 285, predicted: 287 },
    { date: '2025-11-22', actual: 292, predicted: 295 },
    { date: '2025-11-23', actual: 298, predicted: 303 },
    { date: '2025-11-24', actual: 310, predicted: 312 },
    { date: '2025-11-25', actual: 318, predicted: 321 },
    { date: '2025-11-26', actual: 340, predicted: 335 },
    { date: '2025-11-27', actual: 348, predicted: 350 },
    { date: '2025-11-28', predicted: 362 },
    { date: '2025-11-29', predicted: 375 },
    { date: '2025-11-30', predicted: 388 },
    { date: '2025-12-01', predicted: 401 },
    { date: '2025-12-02', predicted: 413 },
    { date: '2025-12-03', predicted: 425 },
]

// Additional chart datasets for different metrics
export const icuOccupancyTrend: ChartDataPoint[] = [
    { date: '2025-11-20', actual: 75, predicted: 74 },
    { date: '2025-11-21', actual: 76, predicted: 76 },
    { date: '2025-11-22', actual: 78, predicted: 78 },
    { date: '2025-11-23', actual: 79, predicted: 80 },
    { date: '2025-11-24', actual: 81, predicted: 82 },
    { date: '2025-11-25', actual: 84, predicted: 84 },
    { date: '2025-11-26', actual: 86, predicted: 87 },
    { date: '2025-11-27', actual: 88, predicted: 89 },
    { date: '2025-11-28', predicted: 91 },
    { date: '2025-11-29', predicted: 93 },
    { date: '2025-11-30', predicted: 94 },
    { date: '2025-12-01', predicted: 95 },
    { date: '2025-12-02', predicted: 96 },
    { date: '2025-12-03', predicted: 97 },
]

export const emergencyVisitsTrend: ChartDataPoint[] = [
    { date: '2025-11-20', actual: 420, predicted: 418 },
    { date: '2025-11-21', actual: 435, predicted: 432 },
    { date: '2025-11-22', actual: 445, predicted: 448 },
    { date: '2025-11-23', actual: 460, predicted: 465 },
    { date: '2025-11-24', actual: 475, predicted: 480 },
    { date: '2025-11-25', actual: 490, predicted: 495 },
    { date: '2025-11-26', actual: 510, predicted: 512 },
    { date: '2025-11-27', actual: 525, predicted: 530 },
    { date: '2025-11-28', predicted: 548 },
    { date: '2025-11-29', predicted: 565 },
    { date: '2025-11-30', predicted: 580 },
    { date: '2025-12-01', predicted: 595 },
    { date: '2025-12-02', predicted: 608 },
    { date: '2025-12-03', predicted: 620 },
]

export const oxygenConsumptionTrend: ChartDataPoint[] = [
    { date: '2025-11-20', actual: 4800, predicted: 4750 },
    { date: '2025-11-21', actual: 4850, predicted: 4900 },
    { date: '2025-11-22', actual: 4950, predicted: 5050 },
    { date: '2025-11-23', actual: 5100, predicted: 5200 },
    { date: '2025-11-24', actual: 5300, predicted: 5400 },
    { date: '2025-11-25', actual: 5500, predicted: 5600 },
    { date: '2025-11-26', actual: 5750, predicted: 5800 },
    { date: '2025-11-27', actual: 5950, predicted: 6050 },
    { date: '2025-11-28', predicted: 6300 },
    { date: '2025-11-29', predicted: 6550 },
    { date: '2025-11-30', predicted: 6800 },
    { date: '2025-12-01', predicted: 7000 },
    { date: '2025-12-02', predicted: 7200 },
    { date: '2025-12-03', predicted: 7350 },
]

export const staffUtilizationTrend: ChartDataPoint[] = [
    { date: '2025-11-20', actual: 1180, predicted: 1175 },
    { date: '2025-11-21', actual: 1195, predicted: 1200 },
    { date: '2025-11-22', actual: 1210, predicted: 1220 },
    { date: '2025-11-23', actual: 1235, predicted: 1245 },
    { date: '2025-11-24', actual: 1260, predicted: 1270 },
    { date: '2025-11-25', actual: 1285, predicted: 1295 },
    { date: '2025-11-26', actual: 1310, predicted: 1320 },
    { date: '2025-11-27', actual: 1335, predicted: 1345 },
    { date: '2025-11-28', predicted: 1368 },
    { date: '2025-11-29', predicted: 1390 },
    { date: '2025-11-30', predicted: 1408 },
    { date: '2025-12-01', predicted: 1425 },
    { date: '2025-12-02', predicted: 1440 },
    { date: '2025-12-03', predicted: 1452 },
]

// Weekly aggregated data for broader trends
export const weeklyTrends: ChartDataPoint[] = [
    { date: 'Week 1', actual: 2650, predicted: 2680 },
    { date: 'Week 2', actual: 2780, predicted: 2820 },
    { date: 'Week 3', actual: 2920, predicted: 2950 },
    { date: 'Week 4', actual: 3100, predicted: 3150 },
    { date: 'Week 5', predicted: 3380 },
    { date: 'Week 6', predicted: 3620 },
]

// Function to generate realistic time series data with trend and noise
export const generateRealisticData = (
    startValue: number,
    endValue: number,
    days: number,
    noiseLevel: number = 0.05
): ChartDataPoint[] => {
    const data: ChartDataPoint[] = []
    const increment = (endValue - startValue) / (days - 1)
    const today = new Date('2025-11-27')

    for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (days - 1 - i))

        const baseValue = startValue + (increment * i)
        const noise = (Math.random() - 0.5) * 2 * baseValue * noiseLevel
        const actualValue = Math.round(baseValue + noise)
        const predictedNoise = (Math.random() - 0.5) * 2 * baseValue * (noiseLevel * 0.5)
        const predictedValue = Math.round(baseValue + predictedNoise)

        const point: ChartDataPoint = {
            date: date.toISOString().split('T')[0]
        }

        // Historical data has both actual and predicted
        if (i < days - 7) {
            point.actual = actualValue
            point.predicted = predictedValue
        } else {
            // Future data has only predicted
            point.predicted = predictedValue
        }

        data.push(point)
    }

    return data
}

// Multi-metric dataset for comprehensive dashboard
export interface MultiMetricData {
    icuOccupancy: ChartDataPoint[]
    generalBeds: ChartDataPoint[]
    emergencyVisits: ChartDataPoint[]
    oxygenConsumption: ChartDataPoint[]
    staffUtilization: ChartDataPoint[]
}

export const multiMetricTrends: MultiMetricData = {
    icuOccupancy: icuOccupancyTrend,
    generalBeds: mockChartData,
    emergencyVisits: emergencyVisitsTrend,
    oxygenConsumption: oxygenConsumptionTrend,
    staffUtilization: staffUtilizationTrend
}

// Export helper to get data by metric type
export const getChartDataByType = (type: string): ChartDataPoint[] => {
    switch (type) {
        case 'icu':
            return icuOccupancyTrend
        case 'beds':
            return mockChartData
        case 'emergency':
            return emergencyVisitsTrend
        case 'medicine':
            return oxygenConsumptionTrend
        case 'staff':
            return staffUtilizationTrend
        default:
            return mockChartData
    }
}