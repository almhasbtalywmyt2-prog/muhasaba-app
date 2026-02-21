import React from 'react';

const ProgressBar = ({ current, target, showLabel = true }) => {
    const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
    const cappedPercentage = Math.min(percentage, 100);

    return (
        <div className="w-full">
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-islamic-emerald-500 to-islamic-gold-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${cappedPercentage}%` }}
                >
                    {cappedPercentage > 0 && (
                        <div className="shimmer h-full w-full"></div>
                    )}
                </div>
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                    <span>{current} / {target}</span>
                    <span className="font-semibold text-islamic-emerald-700">{cappedPercentage}%</span>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
