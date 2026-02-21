import React from 'react';
import ProgressBar from './ProgressBar';

const TrackerCard = ({ item, current, onIncrement, onDecrement }) => {
    const isComplete = current >= item.dailyTarget;
    const percentage = item.dailyTarget > 0 ? Math.round((current / item.dailyTarget) * 100) : 0;

    return (
        <div className={`glass rounded-xl p-5 hover:shadow-2xl transition-all duration-300 ${isComplete ? 'ring-2 ring-islamic-gold-500' : ''
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-4xl">{item.icon}</span>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-islamic-blue-800 font-cairo">
                            {item.nameAr}
                        </h3>
                        <p className="text-sm text-gray-600">
                            الهدف اليومي: {item.dailyTarget} | الأسبوعي: {item.weeklyTarget}
                        </p>
                    </div>
                </div>

                {isComplete && (
                    <span className="text-2xl animate-pulse">✅</span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <ProgressBar current={current} target={item.dailyTarget} />
            </div>

            {/* Counter Controls */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={onDecrement}
                    disabled={current <= 0}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95"
                >
                    ➖ تقليل
                </button>

                <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-3xl font-bold text-islamic-emerald-700">
                        {current}
                    </span>
                    <span className="text-xs text-gray-500">
                        من {item.dailyTarget}
                    </span>
                </div>

                <button
                    onClick={onIncrement}
                    disabled={isComplete}
                    className="flex-1 bg-islamic-emerald-500 hover:bg-islamic-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95"
                >
                    ➕ زيادة
                </button>
            </div>

            {isComplete && (
                <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-islamic-gold-700 animate-pulse">
                        🌟 ما شاء الله! أكملت الهدف اليومي
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrackerCard;
