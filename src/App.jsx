import React from 'react';
import Header from './components/Header';
import ProgressOverview from './components/ProgressOverview';
import TrackerCard from './components/TrackerCard';
import SubmitButton from './components/SubmitButton';
import useTrackerState from './hooks/useTrackerState';
import worshipItems from './data/worshipItems';
import './index.css';

function App() {
    const {
        progress,
        increment,
        decrement,
        getDailyProgress,
        getWeeklyProgress,
        resetProgress
    } = useTrackerState();

    const dailyProgress = getDailyProgress();
    const weeklyProgress = getWeeklyProgress();

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <Header />

                {/* Progress Overview */}
                <ProgressOverview
                    dailyProgress={dailyProgress}
                    weeklyProgress={weeklyProgress}
                />

                {/* Tracker Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {worshipItems.map((item) => (
                        <TrackerCard
                            key={item.id}
                            item={item}
                            current={progress[item.id] || 0}
                            onIncrement={() => increment(item.id)}
                            onDecrement={() => decrement(item.id)}
                        />
                    ))}
                </div>

                {/* Submit Button */}
                <SubmitButton progress={progress} worshipItems={worshipItems} />

                {/* Reset Button */}
                <div className="mt-4 text-center">
                    <button
                        onClick={resetProgress}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm underline transition-colors"
                    >
                        🔄 إعادة تعيين اليوم
                    </button>
                </div>

                {/* Footer */}
                <footer className="mt-8 text-center text-gray-600 text-sm">
                    <p className="font-amiri">
                        ﴿ وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ ﴾
                    </p>
                    <p className="mt-2 font-cairo">
                        تطبيق المحاسبة اليومية - تتبع عباداتك بسهولة
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default App;
