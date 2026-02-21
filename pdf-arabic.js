// ============================================
// تصدير التقرير إلى PDF بالعربية الكاملة
// ============================================

function exportUserReportToPDF() {
    if (!currentReportUser) {
        alert('الرجاء اختيار مستخدم أولاً');
        return;
    }

    // استخدام jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    let yPos = 20;

    // العنوان الرئيسي بالعربية
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ريرقت لماش - ةيموي ةبساحم', 105, yPos, { align: 'center' });
    yPos += 15;

    // اسم المستخدم
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text(`${reverseArabic(currentReportUser)} :مدختسملا`, 105, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    // التاريخ
    doc.setFontSize(12);
    const today = new Date();
    const dateStr = today.toLocaleDateString('ar-SA');
    doc.text(`${dateStr} :خيراتلا`, 105, yPos, { align: 'center' });
    yPos += 15;

    // خط فاصل
    doc.setLineWidth(0.5);
    doc.setDrawColor(102, 126, 234);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // ========================================
    // القسم 1: التقرير اليومي
    // ========================================
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('(مايأ 7 رخآ) يموي ريرقت .1', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // جدول التقرير اليومي
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

    // رأس الجدول
    doc.setFillColor(102, 126, 234);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.text('ىوتسملا', 155, yPos + 5.5);
    doc.text('ةبسنلا', 120, yPos + 5.5);
    doc.text('خيراتلا', 70, yPos + 5.5);
    doc.text('مويلا', 25, yPos + 5.5);
    yPos += 8;

    // بيانات الجدول
    doc.setTextColor(0, 0, 0);
    last7Days.forEach((day, index) => {
        const bgColor = index % 2 === 0 ? 245 : 255;
        doc.setFillColor(bgColor, bgColor, bgColor);
        doc.rect(20, yPos, 170, 7, 'F');

        const dayName = day.date.toLocaleDateString('ar-SA', { weekday: 'short' });
        const dateStr = day.date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'numeric' });
        const percentage = day.data ? day.data.totalPercentage.toFixed(1) + '%' : '-';
        const level = day.data ? reverseArabic(getLevel(day.data.totalPercentage)) : '-';

        doc.text(level, 155, yPos + 5);
        doc.text(percentage, 120, yPos + 5);
        doc.text(dateStr, 70, yPos + 5);
        doc.text(dayName, 25, yPos + 5);
        yPos += 7;
    });

    yPos += 10;

    // ========================================
    // القسم 2: الإحصائيات العامة
    // ========================================
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('ةماعلا تايئاصحلإا .2', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const userData = allData.filter(entry => entry.userName === currentReportUser);
    if (userData.length > 0) {
        const avgTotal = userData.reduce((sum, entry) => sum + entry.totalPercentage, 0) / userData.length;

        doc.text(`موي ${userData.length} :مايلأا ددع`, 25, yPos);
        yPos += 7;
        doc.text(`%${avgTotal.toFixed(1)} :ماعلا طسوتملا`, 25, yPos);
        yPos += 7;
        doc.text(`${reverseArabic(getLevel(avgTotal))} :ءادلأا ىوتسم`, 25, yPos);
        yPos += 10;
    }

    // ========================================
    // القسم 3: أفضل 3 عبادات
    // ========================================
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(76, 175, 80);
    doc.text('تادابع 3 لضفأ .3', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

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

    // أفضل 3
    const best = sortedActivities.slice(0, 3);
    best.forEach((activity, index) => {
        const activityName = reverseArabic(activities[activity].name);
        const percentage = activityAverages[activity].toFixed(1);

        doc.setFillColor(76, 175, 80);
        doc.circle(25, yPos - 1, 2, 'F');
        doc.text(`%${percentage} :${activityName} .${index + 1}`, 30, yPos);
        yPos += 7;
    });

    yPos += 5;

    // ========================================
    // القسم 4: أضعف 3 عبادات
    // ========================================
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 152, 0);
    doc.text('نيسحت جاتحت تادابع 3 فعضأ .4', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // أضعف 3
    const worst = sortedActivities.slice(-3).reverse();
    worst.forEach((activity, index) => {
        const activityName = reverseArabic(activities[activity].name);
        const percentage = activityAverages[activity].toFixed(1);

        doc.setFillColor(255, 152, 0);
        doc.circle(25, yPos - 1, 2, 'F');
        doc.text(`%${percentage} :${activityName} .${index + 1}`, 30, yPos);
        yPos += 7;
    });

    yPos += 5;

    // ========================================
    // القسم 5: التقرير الأسبوعي
    // ========================================
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('(عيباسأ 4 رخآ) يعوبسأ ريرقت .5', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

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

        doc.text(`%${avgScore.toFixed(1)} :(${weekEndStr} - ${weekStartStr}) ${4 - week} عوبسأ`, 25, yPos);
        yPos += 7;
    }

    yPos += 10;

    // ========================================
    // القسم 6: تفاصيل جميع العبادات
    // ========================================
    if (yPos > 200) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('تادابعلا عيمجل ةلصفم ليصافت .6', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // عرض جميع العبادات مع النسب
    sortedActivities.forEach((activity, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        const activityName = reverseArabic(activities[activity].name);
        const percentage = activityAverages[activity].toFixed(1);

        // شريط تقدم
        const barWidth = (percentage / 100) * 150;
        doc.setFillColor(200, 200, 200);
        doc.rect(25, yPos - 3, 150, 5, 'F');

        // تلوين الشريط حسب النسبة
        if (percentage >= 80) {
            doc.setFillColor(76, 175, 80);
        } else if (percentage >= 60) {
            doc.setFillColor(255, 193, 7);
        } else {
            doc.setFillColor(244, 67, 54);
        }
        doc.rect(25, yPos - 3, barWidth, 5, 'F');

        doc.text(`${activityName}`, 25, yPos + 7);
        doc.text(`%${percentage}`, 180, yPos + 7);
        yPos += 12;
    });

    // ========================================
    // التذييل
    // ========================================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`${pageCount} نم ${i} ةحفص`, 105, 287, { align: 'center' });
        doc.text('ةبساحملا ماظن ةطساوب دلوم', 105, 292, { align: 'center' });
    }

    // حفظ الملف
    const fileName = `تقرير_${currentReportUser}_${Date.now()}.pdf`;
    doc.save(fileName);

    showMessage('تم تصدير التقرير الكامل بالعربية بنجاح! 📥');
}

// وظيفة لعكس النص العربي لعرضه بشكل صحيح في PDF
function reverseArabic(text) {
    // عكس النص العربي لأن jsPDF يعرضه معكوساً
    return text.split('').reverse().join('');
}
