// تعريف جميع العبادات المتتبعة
// Definition of all trackable worship items

export const worshipItems = [
    {
        id: 'salah',
        nameAr: 'الصلوات الخمس',
        icon: '🕌',
        dailyTarget: 5,
        weeklyTarget: 35,
        category: 'prayers'
    },
    {
        id: 'sunnah',
        nameAr: 'السنن الرواتب',
        icon: '🤲',
        dailyTarget: 12,
        weeklyTarget: 84,
        category: 'prayers'
    },
    {
        id: 'duha',
        nameAr: 'صلاة الضحى',
        icon: '☀️',
        dailyTarget: 2,
        weeklyTarget: 14,
        category: 'prayers'
    },
    {
        id: 'witr',
        nameAr: 'صلاة الوتر',
        icon: '🌙',
        dailyTarget: 3,
        weeklyTarget: 21,
        category: 'prayers'
    },
    {
        id: 'adhkar-morning-evening',
        nameAr: 'أذكار الصباح والمساء',
        icon: '📿',
        dailyTarget: 2,
        weeklyTarget: 14,
        category: 'adhkar'
    },
    {
        id: 'hundred-adhkar',
        nameAr: 'المائة ذكر',
        icon: '💯',
        dailyTarget: 5,
        weeklyTarget: 35,
        category: 'adhkar'
    },
    {
        id: 'khushu',
        nameAr: 'الخشوع',
        icon: '💚',
        dailyTarget: 5,
        weeklyTarget: 35,
        category: 'spiritual'
    },
    {
        id: 'market-dua',
        nameAr: 'دعاء السوق',
        icon: '🛒',
        dailyTarget: 1,
        weeklyTarget: 7,
        category: 'adhkar'
    },
    {
        id: 'post-prayer-adhkar',
        nameAr: 'أذكار ما بعد الصلاة',
        icon: '✨',
        dailyTarget: 5,
        weeklyTarget: 35,
        category: 'adhkar'
    },
    {
        id: 'sleep-adhkar',
        nameAr: 'أذكار النوم',
        icon: '😴',
        dailyTarget: 1,
        weeklyTarget: 7,
        category: 'adhkar'
    },
    {
        id: 'prophet-stories',
        nameAr: 'قصص الأنبياء',
        icon: '📖',
        dailyTarget: 1,
        weeklyTarget: 1,
        category: 'knowledge'
    }
];

export default worshipItems;
