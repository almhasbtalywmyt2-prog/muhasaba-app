// ============================================
// تصدير التقرير إلى PDF باستخدام html2pdf (دعم عربي كامل)
// ============================================

function exportUserReportToPDF() {
    if (!currentReportUser) {
        alert('الرجاء اختيار مستخدم أولاً');
        return;
    }

    // إنشاء محتوى HTML للتقرير
    const reportHTML = generateReportHTML();

    // إعدادات html2pdf
    const options = {
        margin: 10,
        filename: `تقرير_${currentReportUser}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // تحويل HTML إلى PDF
    html2pdf().set(options).from(reportHTML).save().then(() => {
        showMessage('تم تصدير التقرير الكامل بالعربية بنجاح! 📥');
    });
}

// إنشاء محتوى HTML للتقرير
function generateReportHTML() {
    const userData = allData.filter(entry => entry.userName === currentReportUser);

    // حساب البيانات
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();

        const dayData = allData.find(entry => {
            return entry.userName === currentReportUser && new Date(entry.date).toDateString() === dateString;
        });

        last7Days.push({
            date: date,
            data: dayData
        });
    }

    // حساب متوسط كل عبادة
    const activityAverages = {};
    for (let activity in activities) {
        const scores = userData.map(entry => {
            const score = entry.scores[activity] || 0;
            const max = activities[activity].max;
            return (score / max) * 100;
        });

        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        activityAverages[activity] = avg;
    }

    // ترتيب العبادات
    const sortedActivities = Object.keys(activityAverages).sort((a, b) => {
        return activityAverages[b] - activityAverages[a];
    });

    const best = sortedActivities.slice(0, 3);
    const worst = sortedActivities.slice(-3).reverse();

    // حساب المتوسط العام
    const avgTotal = userData.length > 0
        ? userData.reduce((sum, entry) => sum + entry.totalPercentage, 0) / userData.length
        : 0;

    // بناء HTML
    let html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background: white;">
        <!-- العنوان -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
            <h1 style="color: #667eea; margin: 0; font-size: 28px;">محاسبة يومية - تقرير شامل</h1>
            <h2 style="color: #764ba2; margin: 10px 0; font-size: 22px;">المستخدم: ${currentReportUser}</h2>
            <p style="color: #666; font-size: 14px;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        <!-- القسم 1: التقرير اليومي -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px;">1. تقرير يومي (آخر 7 أيام)</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <th style="padding: 12px; border: 1px solid #ddd;">اليوم</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">التاريخ</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">النسبة</th>
                        <th style="padding: 12px; border: 1px solid #ddd;">المستوى</th>
                    </tr>
                </thead>
                <tbody>`;

    last7Days.forEach((day, index) => {
        const dayName = day.date.toLocaleDateString('ar-SA', { weekday: 'long' });
        const dateStr = day.date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'numeric' });
        const percentage = day.data ? day.data.totalPercentage.toFixed(1) + '%' : '-';
        const level = day.data ? getLevel(day.data.totalPercentage) : '-';
        const bgColor = index % 2 === 0 ? '#f0f8ff' : '#fff';

        html += `
                    <tr style="background: ${bgColor};">
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${dayName}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${dateStr}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${percentage}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${level}</td>
                    </tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>

        <!-- القسم 2: الإحصائيات العامة -->
        <div style="margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px;">2. الإحصائيات العامة</h3>
            <div style="margin-top: 15px;">
                <p style="font-size: 16px; margin: 10px 0;"><strong>عدد الأيام:</strong> ${userData.length} يوم</p>
                <p style="font-size: 16px; margin: 10px 0;"><strong>المتوسط العام:</strong> ${avgTotal.toFixed(1)}%</p>
                <p style="font-size: 16px; margin: 10px 0;"><strong>مستوى الأداء:</strong> ${getLevel(avgTotal)}</p>
            </div>
        </div>

        <!-- القسم 3: أفضل 3 عبادات -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #4caf50; border-right: 4px solid #4caf50; padding-right: 10px;">3. أفضل 3 عبادات ⭐</h3>
            <div style="margin-top: 15px;">`;

    best.forEach((activity, index) => {
        const activityName = activities[activity].name;
        const percentage = activityAverages[activity].toFixed(1);
        html += `
                <div style="margin: 10px 0; padding: 15px; background: rgba(76, 175, 80, 0.1); border-right: 4px solid #4caf50; border-radius: 5px;">
                    <strong style="font-size: 16px;">${index + 1}. ${activityName}</strong><br>
                    <span style="font-size: 20px; color: #4caf50; font-weight: bold;">${percentage}%</span>
                </div>`;
    });

    html += `
            </div>
        </div>

        <!-- القسم 4: أضعف 3 عبادات -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #ff9800; border-right: 4px solid #ff9800; padding-right: 10px;">4. أضعف 3 عبادات تحتاج تحسين 📈</h3>
            <div style="margin-top: 15px;">`;

    worst.forEach((activity, index) => {
        const activityName = activities[activity].name;
        const percentage = activityAverages[activity].toFixed(1);
        html += `
                <div style="margin: 10px 0; padding: 15px; background: rgba(255, 152, 0, 0.1); border-right: 4px solid #ff9800; border-radius: 5px;">
                    <strong style="font-size: 16px;">${index + 1}. ${activityName}</strong><br>
                    <span style="font-size: 20px; color: #ff9800; font-weight: bold;">${percentage}%</span>
                </div>`;
    });

    html += `
            </div>
        </div>

        <!-- القسم 5: التقرير الأسبوعي -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px;">5. تقرير أسبوعي (آخر 4 أسابيع)</h3>
            <div style="margin-top: 15px;">`;

    for (let week = 3; week >= 0; week--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (week * 7 + 6));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (week * 7));

        const weekData = allData.filter(entry => {
            if (entry.userName !== currentReportUser) return false;
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate <= weekEnd;
        });

        const avgScore = weekData.length > 0
            ? weekData.reduce((sum, entry) => sum + entry.totalPercentage, 0) / weekData.length
            : 0;

        const weekStartStr = weekStart.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
        const weekEndStr = weekEnd.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

        html += `
                <p style="font-size: 15px; margin: 8px 0; padding: 10px; background: #f0f8ff; border-radius: 5px;">
                    <strong>أسبوع ${4 - week}</strong> (${weekStartStr} - ${weekEndStr}): <strong style="color: #667eea;">${avgScore.toFixed(1)}%</strong>
                </p>`;
    }

    html += `
            </div>
        </div>

        <!-- القسم 6: تفاصيل جميع العبادات -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px;">6. تفاصيل مفصلة لجميع العبادات</h3>
            <div style="margin-top: 15px;">`;

    sortedActivities.forEach((activity) => {
        const activityName = activities[activity].name;
        const percentage = activityAverages[activity].toFixed(1);
        const barWidth = percentage;
        let barColor = '#f44336';
        if (percentage >= 80) barColor = '#4caf50';
        else if (percentage >= 60) barColor = '#ffc107';

        html += `
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: bold;">${activityName}</span>
                        <span style="font-weight: bold; color: ${barColor};">${percentage}%</span>
                    </div>
                    <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: ${barColor}; width: ${barWidth}%; height: 100%; transition: width 0.3s;"></div>
                    </div>
                </div>`;
    });

    html += `
            </div>
        </div>

        <!-- التذييل -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #888; font-size: 12px;">
            <p>مولد بواسطة نظام المحاسبة اليومية</p>
            <p>${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    </div>
    `;

    return html;
}
