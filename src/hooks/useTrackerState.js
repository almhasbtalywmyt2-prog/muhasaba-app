import { useState, useEffect } from 'react';
import worshipItems from '../data/worshipItems';

const STORAGE_KEY = 'muhasaba-tracker-data';

// Initialize default state
const getInitialState = () => {
    const today = new Date().toDateString();

    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Check if it's from today
            if (parsed.date === today) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing saved data:', e);
        }
    }

    // Create fresh state for today
    const progress = {};
    worshipItems.forEach(item => {
        progress[item.id] = 0;
    });

    return {
        date: today,
        progress,
        weeklyProgress: {} // Could track weekly stats here
    };
};

export const useTrackerState = () => {
    const [state, setState] = useState(getInitialState);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Increment counter for an item
    const increment = (itemId) => {
        const item = worshipItems.find(i => i.id === itemId);
        if (!item) return;

        setState(prev => {
            const currentValue = prev.progress[itemId] || 0;
            if (currentValue >= item.dailyTarget) {
                return prev; // Already at max
            }
            return {
                ...prev,
                progress: {
                    ...prev.progress,
                    [itemId]: currentValue + 1
                }
            };
        });
    };

    // Decrement counter for an item
    const decrement = (itemId) => {
        setState(prev => {
            const currentValue = prev.progress[itemId] || 0;
            if (currentValue <= 0) {
                return prev; // Already at min
            }
            return {
                ...prev,
                progress: {
                    ...prev.progress,
                    [itemId]: currentValue - 1
                }
            };
        });
    };

    // Calculate overall daily progress percentage
    const getDailyProgress = () => {
        let totalCompleted = 0;
        let totalTargets = 0;

        worshipItems.forEach(item => {
            const current = state.progress[item.id] || 0;
            totalCompleted += current;
            totalTargets += item.dailyTarget;
        });

        return totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;
    };

    // Calculate weekly progress percentage
    const getWeeklyProgress = () => {
        let totalCompleted = 0;
        let totalTargets = 0;

        worshipItems.forEach(item => {
            const current = state.progress[item.id] || 0;
            totalCompleted += current;
            totalTargets += item.weeklyTarget;
        });

        return totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;
    };

    // Reset all progress (new day)
    const resetProgress = () => {
        const today = new Date().toDateString();
        const progress = {};
        worshipItems.forEach(item => {
            progress[item.id] = 0;
        });

        setState({
            date: today,
            progress,
            weeklyProgress: {}
        });
    };

    // Get current Hijri date (simplified - would need proper library for accuracy)
    const getHijriDate = () => {
        // This is a simplified placeholder
        // For production, use a library like moment-hijri
        return 'التاريخ الهجري';
    };

    return {
        progress: state.progress,
        increment,
        decrement,
        getDailyProgress,
        getWeeklyProgress,
        resetProgress,
        getHijriDate,
        currentDate: state.date
    };
};

export default useTrackerState;
