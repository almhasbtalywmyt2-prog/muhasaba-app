import React from 'react';

const ProgressOverview = ({ dailyProgress, weeklyProgress }) => {
    const getMotivationalText = (progress) => {
        if (progress === 100) return '🎉 ما شاء الله! أكملت جميع الأهداف';
        if (progress >= 75) return '💪 ممتاز! استمر في التقدم';
        if (progress >= 50) return '👍 جيد جداً! نصف الطريق';
        if (progress >= 25) return '🌟 بداية موفقة! واصل';
        return '🤲 ابدأ رحلتك اليوم';
    };

    return (
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-islamic-blue-800 mb-4 text-center font-cairo">
                نظرة عامة على التقدم
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Progress Circle */}
                <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 mb-3">
                        <svg className="transform -rotate-90 w-40 h-40">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#e5e7eb"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="url(#gradient-daily)"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - dailyProgress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient-daily" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#eab308" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-islamic-emerald-700">{dailyProgress}%</span>
                            <span className="text-sm text-gray-600 mt-1">يومي</span>
                        </div>
                    </div>
                    <p className="text-center text-islamic-blue-700 font-semibold">
                        التقدم اليومي
                    </p>
                </div>

                {/* Weekly Progress Circle */}
                <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 mb-3">
                        <svg className="transform -rotate-90 w-40 h-40">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#e5e7eb"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="url(#gradient-weekly)"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - weeklyProgress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient-weekly" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1e40af" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-islamic-blue-700">{weeklyProgress}%</span>
                            <span className="text-sm text-gray-600 mt-1">أسبوعي</span>
                        </div>
                    </div>
                    <p className="text-center text-islamic-blue-700 font-semibold">
                        التقدم الأسبوعي
                    </p>
                </div>
            </div>

            {/* Motivational Text */}
            <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-islamic-gold-700 font-cairo">
                    {getMotivationalText(dailyProgress)}
                </p>
            </div>
        </div>
    );
};

export default ProgressOverview;
