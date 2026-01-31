import React from 'react';
import { Database, Users } from 'lucide-react';

interface Props {
    icuOccupied: number;
    icuTotal: number;
    wardOccupied: number;
    wardTotal: number;
}

const ResourcePanel: React.FC<Props> = ({ icuOccupied, icuTotal, wardOccupied, wardTotal }) => {
    const getPercent = (occ: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.round((occ / total) * 100);
    };

    const renderBar = (label: string, occ: number, total: number) => {
        const pct = getPercent(occ, total);
        const color = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-blue-500";

        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 text-gray-300">
                    <span className="font-bold">{label}</span>
                    <span>{occ} / {total} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg h-full">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database size={16} /> Hospital Resources
            </h3>
            {renderBar("ICU Beds", icuOccupied, icuTotal)}
            {renderBar("General Ward", wardOccupied, wardTotal)}

            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-3 text-sm text-gray-400">
                <Users size={16} />
                <span>Staff Load: Normal</span>
            </div>
        </div>
    );
};

export default ResourcePanel;
