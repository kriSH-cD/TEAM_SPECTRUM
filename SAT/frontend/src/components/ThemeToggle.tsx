import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
    isDarkMode: boolean;
    onToggle: () => void;
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle, className = '' }) => {
    return (
        <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                } ${className}`}
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
};

export default ThemeToggle;
