import React, { useState } from 'react';
import { Brain, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureExplanation {
    feature: string;
    importance: number;
    description?: string;
}

interface AIExplanationPanelProps {
    explanations: FeatureExplanation[];
    confidenceScore: number;
    aiSummary?: string;
    maxFeatures?: number;
    showTooltips?: boolean;
}

const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
    explanations,
    confidenceScore,
    aiSummary,
    maxFeatures = 4,
    showTooltips = true
}) => {
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

    // Get top N features
    const topFeatures = explanations
        .sort((a, b) => b.importance - a.importance)
        .slice(0, maxFeatures);

    // Feature descriptions for tooltips
    const featureDescriptions: Record<string, string> = {
        'temperature': 'Higher temperatures can increase disease transmission and affect patient comfort',
        'humidity': 'Humidity levels influence airborne disease spread and respiratory conditions',
        'aqi': 'Air Quality Index affects respiratory health and admission rates',
        'previous_admissions': 'Historical admission patterns help predict future demand',
        'day_of_week': 'Certain days show higher admission patterns due to social factors',
        'holiday': 'Holidays impact hospital visits and resource availability',
        'season': 'Seasonal changes affect disease prevalence and admission rates',
        'population_density': 'Higher density areas typically see more hospital admissions',
        'rainfall': 'Rainfall affects disease spread and emergency admissions',
        'covid_cases': 'COVID-19 case numbers directly impact ICU and bed demand'
    };

    // Confidence level styling
    const getConfidenceStyle = (score: number) => {
        if (score >= 0.8) return { color: 'green', label: 'High', icon: TrendingUp };
        if (score >= 0.6) return { color: 'blue', label: 'Good', icon: Info };
        if (score >= 0.4) return { color: 'orange', label: 'Moderate', icon: AlertCircle };
        return { color: 'red', label: 'Low', icon: AlertCircle };
    };

    const confidenceStyle = getConfidenceStyle(confidenceScore);
    const ConfidenceIcon = confidenceStyle.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200 dark:border-purple-800 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg">
                        <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                            AI Explanation
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Forecast Factors Analysis
                        </p>
                    </div>
                </div>

                {/* Confidence Score */}
                <div className="flex items-center space-x-2">
                    <ConfidenceIcon
                        className={`w-4 h-4 md:w-5 md:h-5 ${confidenceStyle.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                confidenceStyle.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                    confidenceStyle.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-red-600 dark:text-red-400'
                            }`}
                    />
                    <div className="text-right">
                        <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            {(confidenceScore * 100).toFixed(0)}%
                        </div>
                        <div className={`text-xs font-medium ${confidenceStyle.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                confidenceStyle.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                    confidenceStyle.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-red-600 dark:text-red-400'
                            }`}>
                            {confidenceStyle.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            {aiSummary && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-100 dark:border-purple-700">
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {aiSummary}
                    </p>
                </div>
            )}

            {/* Feature Importance List */}
            <div className="space-y-3 md:space-y-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                    <span>Top {maxFeatures} Influencing Factors</span>
                    {showTooltips && (
                        <Info className="w-3 h-3 text-gray-400" />
                    )}
                </h4>

                {topFeatures.map((feature, index) => (
                    <div
                        key={index}
                        className="relative"
                        onMouseEnter={() => showTooltips && setHoveredFeature(feature.feature)}
                        onMouseLeave={() => setHoveredFeature(null)}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                                    {feature.feature.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400">
                                {(feature.importance * 100).toFixed(1)}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 md:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${feature.importance * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            />
                        </div>

                        {/* Tooltip */}
                        {showTooltips && hoveredFeature === feature.feature && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute left-0 right-0 -top-16 md:-top-14 z-10 p-2 md:p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl text-xs leading-relaxed"
                            >
                                {feature.description || featureDescriptions[feature.feature.toLowerCase()] ||
                                    `${feature.feature} is a key factor in the AI prediction model`}
                                <div className="absolute left-6 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 md:mt-6 pt-4 border-t border-purple-200 dark:border-purple-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Powered by Multi-Model AI Ensemble • Updated in real-time
                </p>
            </div>
        </motion.div>
    );
};

export default AIExplanationPanel;
