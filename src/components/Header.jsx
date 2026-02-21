import React, { useState } from 'react';

// Format a Date object to Arabic display string
const formatArabicDate = (date) => {
    return date.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Format a Date object to YYYY-MM-DD for the input[type=date]
const toInputValue = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Header = ({ onDateChange }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value + 'T00:00:00');
        setSelectedDate(newDate);
        if (onDateChange) onDateChange(newDate);
    };

    const toggleEdit = () => setIsEditing((prev) => !prev);

    return (
        <header className="glass rounded-2xl p-6 mb-6 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-amiri text-islamic-emerald-700 mb-3">
                    المحاسبة اليومية
                </h1>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-islamic-emerald-500 via-islamic-gold-500 to-islamic-emerald-500 rounded-full mb-4"></div>

                {/* Date display / edit area */}
                <div className="flex items-center justify-center gap-3">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={toInputValue(selectedDate)}
                                onChange={handleDateChange}
                                className="border border-islamic-emerald-400 rounded-lg px-3 py-1 text-islamic-blue-800 font-cairo text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-islamic-emerald-400 cursor-pointer"
                                style={{ direction: 'ltr' }}
                            />
                            <button
                                onClick={toggleEdit}
                                title="تأكيد التاريخ"
                                className="bg-islamic-emerald-500 hover:bg-islamic-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors shadow"
                            >
                                ✓
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-islamic-blue-800 font-cairo text-lg">
                                {formatArabicDate(selectedDate)}
                            </p>
                            <button
                                onClick={toggleEdit}
                                title="تعديل التاريخ"
                                className="text-islamic-emerald-600 hover:text-islamic-emerald-800 transition-colors text-base"
                            >
                                ✏️
                            </button>
                        </>
                    )}
                </div>

                <p className="text-islamic-blue-600 text-sm mt-3 font-amiri">
                    ﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾
                </p>
            </div>
        </header>
    );
};

export default Header;
