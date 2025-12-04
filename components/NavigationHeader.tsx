import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface NavigationHeaderProps {
    currentScreen: string;
    onBack: () => void;
    title?: string;
}

const MAIN_SCREENS = ['dashboard', 'adminDashboard', 'financeDashboard'];

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ currentScreen, onBack, title }) => {
    const showBackButton = !MAIN_SCREENS.includes(currentScreen);

    if (!showBackButton) return null;

    return (
        <div className="px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center gap-3 sticky top-0 z-40">
            <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700"
            >
                <ArrowLeft size={20} />
            </button>
            {title && (
                <h2 className="font-bold text-lg text-gray-800 truncate">{title}</h2>
            )}
        </div>
    );
};
