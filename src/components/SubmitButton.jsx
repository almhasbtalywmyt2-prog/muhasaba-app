import React, { useState } from 'react';

const SubmitButton = ({ progress, worshipItems }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setMessage('');

        // Prepare report data
        const report = {
            date: new Date().toISOString(),
            gregorianDate: new Date().toLocaleDateString('ar-SA'),
            items: worshipItems.map(item => ({
                id: item.id,
                nameAr: item.nameAr,
                completed: progress[item.id] || 0,
                target: item.dailyTarget,
                percentage: Math.round(((progress[item.id] || 0) / item.dailyTarget) * 100)
            })),
            totalProgress: calculateTotalProgress()
        };

        try {
            const response = await fetch('http://localhost:3000/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report)
            });

            if (response.ok) {
                setMessage('✅ تم إرسال التقرير بنجاح! جزاك الله خيراً');
            } else {
                setMessage('⚠️ حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            setMessage('❌ تعذر الاتصال بالخادم. تأكد من تشغيل الخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotalProgress = () => {
        let totalCompleted = 0;
        let totalTargets = 0;

        worshipItems.forEach(item => {
            const current = progress[item.id] || 0;
            totalCompleted += current;
            totalTargets += item.dailyTarget;
        });

        return totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;
    };

    return (
        <div className="glass rounded-2xl p-6 mt-6">
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-islamic-emerald-600 to-islamic-gold-600 hover:from-islamic-emerald-700 hover:to-islamic-gold-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg"
            >
                {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال التقرير إلى النظام'}
            </button>

            {message && (
                <div className={`mt-4 p-4 rounded-lg text-center font-semibold animate-fade-in ${message.includes('✅') ? 'bg-green-100 text-green-800' :
                        message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {message}
                </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-600">
                <p>سيتم حفظ تقريرك اليومي في النظام</p>
            </div>
        </div>
    );
};

export default SubmitButton;
