// =============================================
// نظام المحاسبة اليومية - Firebase Cloud
// مزامنة البيانات بين جميع الأجهزة
// =============================================

// --- Firebase CDN ---
// يتم تحميل Firebase من HTML

// --- البنود الافتراضية ---
const defaultActivities = {
    quran: { name: "الورد القرآني", max: 4, type: "radio" },
    prayers: { name: "الصلوات الخمس جماعة", max: 5, type: "radio" },
    khushoo: { name: "تحري الخشوع", max: 7, type: "radio" },
    prayerAdhkar: { name: "أذكار الصلوات", max: 5, type: "radio" },
    morningEvening: { name: "أذكار الصباح والمساء", max: 2, type: "radio" },
    taraweeh: { name: "صلاة التراويح", max: 8, type: "radio", customValues: [2, 4, 6, 8] },
    duha: { name: "صلاة الضحى", max: 4, type: "radio", customValues: [2, 4] },
    witr: { name: "صلاة الوتر", max: 1, type: "checkbox" },
    adhkar100: { name: "الأذكار المئوية", max: 5, type: "radio" },
    iftarDua: { name: "الدعاء عند الإفطار", max: 1, type: "checkbox" },
    reading: { name: "القراءة من الكتاب", max: 10, type: "reading" },
    benefits: { name: "الفوائد (إرسالها)", max: 1, type: "checkbox" },
    sadaqah: { name: "الصدقة اليومية", max: 1, type: "checkbox" },
    marketDua: { name: "دعاء السوق", max: 1, type: "checkbox" },
    sunrise: { name: "الجلوس إلى الشروق", max: 1, type: "checkbox" },
    familyTies: { name: "صلة الرحم", max: 1, type: "checkbox" }
};

const defaultUsers = [
    "بلال طاهر", "صالح العواوي", "صخر حنكل", "محمد نبيل", "سيف القاضي",
    "صهيب طاهر", "عبدالعزيز العواوي", "مجاهد جعوان", "عبدالرحمن بطاح",
    "عبدالرحمن الحللي", "يوسف عايض", "هلال العوي", "عبدالحميد نوفل",
    "شاكر مساعد", "محمد الحدي"
];

// --- Supabase Config ---
const SUPABASE_URL = 'https://moaosdyamrorzqtekakj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__novwJIZbe9n8GtnUX3g-A_0FhJi47y';

let supabaseClient = null;
try {
    if (typeof supabasejs !== 'undefined') {
        supabaseClient = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client initialized (supabasejs)');
    } else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client initialized (window.supabase)');
    } else {
        console.warn('⚠️ Supabase SDK غير محمل - سيتم استخدام البيانات المحلية');
    }
} catch (e) {
    console.error('❌ فشل تهيئة Supabase Client:', e);
}

// --- المتغيرات العامة ---
let users = [];
let allData = [];
let cycles = [];
let activities = {};
let systemUsers = [];
let currentCycleId = 'current';
let currentUser = null;
let currentReportUser = null;
let _appInitialized = false;

// --- تحميل بيانات الجلسة المحلية ---
function loadFromStorage() {
    currentUser = JSON.parse(localStorage.getItem('muhasabaCurrentUser') || 'null');
    currentCycleId = localStorage.getItem('selectedCycleId') || 'current';
}

// --- الاستماع للبيانات من Supabase ---
// --- الاستماع للبيانات من Supabase ---
async function initFirebaseListeners() {
    if (!supabaseClient) {
        console.warn('⚠️ لن يتم جلب البيانات من السحاب لعدم توفر العميل (Client)');
        return;
    }

    try {
        console.log('🔄 جاري محاولة مزامنة البيانات من Supabase...');

        // جلب الإعدادات (المستخدمين، الأنشطة، الدورات) بمؤقت زمني سريع (2 ثانية فقط)
        const fetchSettings = supabaseClient.from('settings').select('*');
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));

        const { data: settings, error } = await Promise.race([fetchSettings, timeout]);

        if (error) throw error;

        // تحويل المصفوفة من Supabase إلى كائن إعدادات
        const config = (settings || []).reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        let dataChanged = false;
        if (config.users && ensureArray(config.users).length > 0) { users = config.users; dataChanged = true; }
        if (config.activities) { activities = config.activities; dataChanged = true; }
        if (config.cycles && ensureArray(config.cycles).length > 0) { cycles = config.cycles; dataChanged = true; }
        if (config.systemUsers && ensureArray(config.systemUsers).length > 0) { systemUsers = config.systemUsers; dataChanged = true; }

        // جلب البيانات الأساسية (التقارير)
        const { data: reports, error: reportsError } = await supabaseClient.from('reports').select('*');
        if (!reportsError && reports) {
            allData = reports.map(r => ({ ...r.data, id: r.id }));
            dataChanged = true;
        }

        if (dataChanged) {
            console.log('✅ تم تحديث البيانات من السحاب');
            initPage();
        }
    } catch (e) {
        console.error('❌ تعذر المزامنة مع السحاب (قد يكون بسبب تغيير الحساب أو ضعف الإنترنت):', e);
    }
}

function useDefaults() {
    users = [...defaultUsers];
    activities = { ...defaultActivities };
    systemUsers = JSON.parse(localStorage.getItem('muhasabaSystemUsers') || 'null') || [
        { id: 'u_admin', username: 'admin', password: '123', role: 'Owner', name: 'المالك الرئيسي' }
    ];
    cycles = [];
    allData = [];
    console.log('💡 تم تفعيل الإعدادات الافتراضية');
}

// --- تحديث الواجهة عند وصول بيانات ---
function initPage() {
    if (typeof populateAllSelects === 'function') populateAllSelects();
    if (typeof generateDynamicForms === 'function') generateDynamicForms();
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof loadRankingSystem === 'function') loadRankingSystem();
    if (typeof applyRolePermissions === 'function') applyRolePermissions();
    if (typeof updateUserProfileDisplay === 'function') updateUserProfileDisplay();
    if (typeof updateGlobalCycleSelector === 'function') updateGlobalCycleSelector();
}

// تهيئة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function () {
    console.log('🏁 بدء تشغيل النظام...');
    loadFromStorage();
    useDefaults(); // تحميل البيانات الافتراضية فوراً لضمان واجهة سريعة
    initPage();    // رسم الواجهة فوراً

    _appInitialized = true;

    // محاكاة الاتصال بالسحاب في الخلفية دون تعطيل المستخدم
    setTimeout(() => {
        initFirebaseListeners();
    }, 100);
});

// --- حفظ البيانات في Supabase ---
async function saveSettings(key, value) {
    if (!supabaseClient) return;
    try {
        await supabaseClient.from('settings').upsert({ key: key, value: value }, { onConflict: 'key' });
    } catch (err) {
        console.error("❌ فشل حفظ الإعدادات:", err);
    }
}

function saveUsers() {
    saveSettings('users', users);
}

// دالة محسنة لحفظ البيانات في Supabase
async function saveData(newItem = null) {
    if (!supabaseClient) {
        console.warn("⚠️ لا يوجد اتصال بـ Supabase");
        return;
    }

    if (newItem) {
        try {
            const { error } = await supabaseClient
                .from('reports')
                .insert([{ user_name: newItem.userName, data: newItem, total_percentage: newItem.totalPercentage }]);

            if (error) throw error;
            console.log("✅ تم الحفظ في Supabase بنجاح");
        } catch (err) {
            console.error("❌ فشل الحفظ في Supabase:", err);
        }
    } else {
        // في حال الحذف، نحتاج لآلية أخرى أو مسح الكل وإعادة الإرسال (غير محبذ في SQL)
        console.warn("⚠️ لم يتم تنفيذ مسح الكل في Supabase حالياً");
    }
}

function saveCyclesStorage() {
    saveSettings('cycles', cycles);
}
function saveActivitiesStorage() {
    saveSettings('activities', activities);
}
function saveSystemUsers() {
    saveSettings('systemUsers', systemUsers);
    localStorage.setItem('muhasabaSystemUsers', JSON.stringify(systemUsers));
}

// --- دالة مساعدة ---
const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return Object.values(data);
    return [];
};

// --- الصلاحيات ---
function hasPermission(act) {
    if (!currentUser) return false;
    if (currentUser.role === 'Owner') return true;
    const p = {
        'delete_entry': ['Owner'],
        'manage_users': ['Owner'],
        'manage_activities': ['Owner'],
        'manage_cycles': ['Owner'],
        'export_pdf': ['Owner', 'Staff'],
        'view_reports': ['Owner', 'Staff', 'Viewer']
    };
    return p[act]?.includes(currentUser.role) || false;
}

function applyRolePermissions() {
    if (!currentUser) return;
    const isOwner = currentUser.role === 'Owner';
    if (!hasPermission('delete_entry')) document.querySelectorAll('.delete-btn').forEach(b => b.style.display = 'none');
    if (!hasPermission('export_pdf')) document.querySelectorAll('button[onclick*="PDF"]').forEach(b => b.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => {
        const click = b.getAttribute('onclick') || '';
        const restricted = ['systemUsers', 'manageCycles', 'manageActivities', 'users'].some(p => click.includes(p));
        if (restricted && !isOwner) b.style.display = 'none';
    });
}

function updateUserProfileDisplay() {
    const el = document.getElementById('currentUserDisplay');
    if (el && currentUser) {
        el.textContent = `👤 ${currentUser.name} (${currentUser.role === 'Owner' ? 'مالك' : currentUser.role === 'Staff' ? 'مسئول' : 'مشاهد'})`;
    }
}

// --- قوائم المستخدمين ---
function populateAllSelects() {
    ['userName', 'reportUserSelect', 'userSelect', 'weaknessUserSelect'].forEach(id => {
        const s = document.getElementById(id);
        if (!s) return;
        const val = s.value;
        while (s.options.length > 1) s.remove(1);
        users.forEach(u => {
            const o = document.createElement('option');
            o.value = u;
            o.textContent = u;
            s.appendChild(o);
        });
        if (val) s.value = val;
    });
}

// --- النماذج الديناميكية ---
function generateDynamicForms() {
    const containers = document.querySelectorAll('.dynamic-activities-container');
    if (containers.length === 0) return;
    let html = '';
    for (const id in activities) {
        const a = activities[id];
        html += `<div class="form-section"><h3>${a.name}</h3>`;
        if (a.type === 'radio') {
            html += `<div class="radio-group"><label><input type="radio" name="${id}" value="0"> 0</label>`;
            const vals = a.customValues || Array.from({ length: a.max }, (_, i) => i + 1);
            vals.forEach(v => { html += `<label><input type="radio" name="${id}" value="${v}"> ${v}</label>`; });
            html += `</div>`;
        } else if (a.type === 'checkbox') {
            html += `<div class="checkbox-group"><label><input type="checkbox" name="${id}" value="1"> نعم</label></div>`;
        } else if (a.type === 'reading') {
            html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:10px;">
                <div><label>إلى أي صفحة وصلت؟</label><input type="text" id="currentPage" placeholder="رقم الصفحة" style="width:100%; padding:8px;"></div>
                <div><label>كم صفحة قرأت اليوم؟</label><input type="number" id="readingPages" placeholder="عدد" style="width:100%; padding:8px;"></div>
            </div><label><input type="checkbox" id="bookDone"> تم الإكمال ✅</label>`;
        }
        html += `</div>`;
    }
    containers.forEach(c => c.innerHTML = html);
}

// --- إرسال النموذج ---
function submitForm(event) {
    event.preventDefault();
    const uname = document.getElementById('userName').value;
    if (!uname) { alert('اختر الاسم'); return; }
    const dateStr = document.getElementById('dateInput')?.value;
    const date = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
    const data = { userName: uname, date: date.toISOString(), timestamp: date.getTime(), scores: {} };

    for (const id in activities) {
        if (id === 'reading') {
            const p = parseInt(document.getElementById('readingPages')?.value) || 0;
            data.readingDetails = {
                actualPages: p,
                rechedPage: document.getElementById('currentPage')?.value,
                isDone: document.getElementById('bookDone')?.checked
            };
            data.scores[id] = (data.readingDetails.isDone || p >= 10) ? 10 : p;
        } else {
            const inp = document.querySelector(`input[name="${id}"]:checked`);
            data.scores[id] = inp ? (inp.type === 'radio' ? parseInt(inp.value) : 1) : 0;
        }
    }
    const activityKeys = Object.keys(activities);
    if (activityKeys.length === 0) {
        data.totalPercentage = 0;
    } else {
        data.totalPercentage = activityKeys.reduce((s, id) => s + (data.scores[id] / (activities[id].max || 1)), 0) / activityKeys.length * 100;
    }

    if (isNaN(data.totalPercentage)) data.totalPercentage = 0;
    data.level = getLevel(data.totalPercentage);

    // تم التعديل: نرسل العنصر الجديد للدالة مباشرة لمنع تضارب البيانات
    saveData(data);

    document.getElementById('dailyForm').reset();
    if (document.getElementById('userName')) document.getElementById('userName').value = '';
    if (document.getElementById('personalLink')) document.getElementById('personalLink').style.display = 'none';

    showMessage(`تم الحفظ بنجاح ✅<br>النسبة: ${data.totalPercentage.toFixed(1)}%`);
    loadDashboard();
}

function getLevel(p) {
    if (p >= 90) return '🏆 ممتاز';
    if (p >= 80) return '⭐ جيد جداً';
    if (p >= 70) return '✨ جيد';
    if (p >= 60) return '💫 مقبول';
    return '📈 يحتاج تحسين';
}

// --- لوحة التحكم ---
function loadDashboard() {
    const f = document.getElementById('dashboardDateFilter');
    const date = f && f.value ? new Date(f.value + 'T12:00:00') : new Date();
    const str = date.toDateString();
    const today = allData.filter(e => {
        try {
            return new Date(e.date).toDateString() === str;
        } catch (err) {
            return false;
        }
    });

    const validEntries = today.filter(e => !isNaN(e.totalPercentage));
    const avg = validEntries.length > 0 ? (validEntries.reduce((s, e) => s + e.totalPercentage, 0) / validEntries.length).toFixed(1) : 0;

    if (document.getElementById('todayCount')) document.getElementById('todayCount').textContent = today.length;
    if (document.getElementById('notDoneCount')) document.getElementById('notDoneCount').textContent = users.length - today.length;
    if (document.getElementById('avgScore')) document.getElementById('avgScore').textContent = `${avg}%`;
    if (document.getElementById('totalUsersLabel')) document.getElementById('totalUsersLabel').textContent = `من أصل ${users.length} (اضغط للعرض)`;

    const body = document.getElementById('leaderboardBody');
    if (body) {
        body.innerHTML = today.length > 0
            ? today.sort((a, b) => b.totalPercentage - a.totalPercentage)
                .map((e, i) => `<tr><td>${i + 1}</td><td>${e.userName}</td><td>${e.totalPercentage.toFixed(1)}%</td><td>${e.level}</td><td><button onclick="deleteEntry('${e.id}')" style="background:#ff4d4d; border:none; color:white; padding:5px; border-radius:4px;">🗑️</button></td></tr>`)
                .join('')
            : '<tr><td colspan="5">لا توجد بيانات</td></tr>';
    }
    window.currentDashboardDoneUsers = today;
    window.currentDashboardNotDoneUsers = users.filter(u => !today.some(d => d.userName === u));
    drawWeeklyChart();
}

function setDashboardToday() {
    const f = document.getElementById('dashboardDateFilter');
    if (f) { f.value = new Date().toISOString().split('T')[0]; loadDashboard(); }
}

async function deleteEntry(id) {
    if (!confirm('حذف السجل؟')) return;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('reports').delete().eq('id', id);
        if (error) {
            console.error("❌ فشل الحذف من السحاب:", error);
            alert("فشل الحذف من السحاب");
            return;
        }
    }

    allData = allData.filter(e => e.id !== id);
    loadDashboard();
    showMessage("تم الحذف بنجاح ✅");
}

function showDoneUsers() { modalShow('✅ الذين قاموا بالمحاسبة', window.currentDashboardDoneUsers, true); }
function showNotDoneUsers() { modalShow('⏳ الذين لم يقوموا بالمحاسبة', window.currentDashboardNotDoneUsers, false); }
function modalShow(t, l, d) {
    const m = document.getElementById('dashboardModal');
    document.getElementById('modalTitle').textContent = t;
    document.getElementById('modalBody').innerHTML = `<ul class="modal-list">${l.length > 0 ? l.map(x => `<li>${d ? x.userName + ' (' + x.totalPercentage.toFixed(1) + '%)' : x}</li>`).join('') : '<li>لا يوجد</li>'}</ul>`;
    m.style.display = 'block';
}
function closeDashboardModal() { document.getElementById('dashboardModal').style.display = 'none'; }

function drawWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx || typeof Chart === 'undefined') return;
    const l = [], v = [], t = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(t.getDate() - i);
        l.push(d.toLocaleDateString('ar-SA', { weekday: 'short' }));
        const dd = allData.filter(e => new Date(e.date).toDateString() === d.toDateString());
        v.push(dd.length > 0 ? (dd.reduce((s, x) => s + x.totalPercentage, 0) / dd.length).toFixed(1) : 0);
    }
    if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();
    new Chart(ctx, { type: 'line', data: { labels: l, datasets: [{ label: 'متوسط الأداء', data: v, borderColor: '#667eea', tension: 0.4 }] }, options: { scales: { y: { beginAtZero: true, max: 100 } } } });
}

// --- التصنيف والبودويم ---
function getFilteredData() {
    let cycle = cycles.find(c => (currentCycleId === 'current' ? c.isActive : c.id === currentCycleId));
    if (currentCycleId === 'all' || !cycle) return allData;
    const s = cycle.startDate ? new Date(cycle.startDate + 'T00:00:00') : null;
    const e = cycle.endDate ? new Date(cycle.endDate + 'T23:59:59') : null;
    return allData.filter(x => { const d = new Date(x.timestamp); return (!s || d >= s) && (!e || d <= e); });
}

function loadRankingSystem() {
    const s = document.getElementById('rankingStartDate')?.value;
    const e = document.getElementById('rankingEndDate')?.value;
    if (!s || !e) return;
    const start = new Date(s + 'T00:00:00'), end = new Date(e + 'T23:59:59');
    const filtered = getFilteredData().filter(x => { const d = new Date(x.timestamp); return d >= start && d <= end; });
    const stats = {};
    filtered.forEach(x => {
        if (!stats[x.userName]) stats[x.userName] = { t: 0, c: 0 };
        stats[x.userName].t += x.totalPercentage;
        stats[x.userName].c++;
    });
    const r = Object.keys(stats).map(n => ({ name: n, avg: stats[n].t / stats[n].c, days: stats[n].c })).sort((a, b) => b.avg - a.avg);

    const pc = document.getElementById('podiumContainer');
    if (pc) {
        let ph = '';
        [1, 0, 2].forEach(idx => {
            const u = r[idx];
            if (u) {
                const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                ph += `<div style="text-align:center; flex:1; min-width:80px;"><div>${['🥈', '🥇', '🥉'][idx]}</div><div style="font-weight:bold; font-size:0.9em;">${u.name}</div><div style="height:${[100, 130, 80][idx]}px; background:${colors[idx]}; border-radius:10px 10px 0 0; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">${u.avg.toFixed(1)}%</div></div>`;
            }
        });
        pc.innerHTML = ph;
    }
    const body = document.getElementById('rankingTableBody');
    if (body) body.innerHTML = r.length > 0
        ? r.map((u, i) => `<tr><td>${i + 1}</td><td>${u.name}</td><td>${u.avg.toFixed(1)}%</td><td>${u.days}</td><td>${getLevel(u.avg)}</td></tr>`).join('')
        : '<tr><td colspan="5">لا توجد بيانات</td></tr>';

    const enc = document.getElementById('encouragementSection'), wlist = document.getElementById('weakPerformersList');
    if (enc && wlist) {
        const weak = r.filter(u => u.avg < 60).slice(-3);
        if (weak.length > 0) {
            enc.style.display = 'block';
            wlist.innerHTML = weak.map(u => `<div style="background:white; padding:10px; border-radius:8px; border-right:4px solid #ff4d4d;"><strong>${u.name}</strong>: ${u.avg.toFixed(1)}%</div>`).join('');
        } else {
            enc.style.display = 'none';
        }
    }
}

// --- إدارة البنود ---
function loadActivitiesManagement() {
    const l = document.getElementById('activitiesList');
    if (!l) return;
    l.innerHTML = Object.keys(activities).map(id => {
        const a = activities[id];
        return `<div class="weakness-card" style="padding:15px;"><div style="display:flex; justify-content:space-between; align-items:center;"><strong>${a.name}</strong><div><button onclick="editAct('${id}')">📝</button><button onclick="delAct('${id}')">🗑️</button></div></div><small>${a.type} | Max: ${a.max}</small></div>`;
    }).join('');
}

function saveAct() {
    saveActivitiesStorage();
    loadActivitiesManagement();
    generateDynamicForms();
}

function addActivity() {
    const n = document.getElementById('newActivityName').value;
    const m = parseInt(document.getElementById('newActivityMax').value) || 1;
    const t = document.getElementById('newActivityType').value;
    const o = document.getElementById('newActivityOptions').value;
    if (!n) return;
    const id = 'act_' + Date.now();
    activities[id] = { name: n, type: t, max: m };
    if (o) activities[id].customValues = o.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    saveAct();
    showMessage('تم الإضافة ✅');
}

function delAct(id) {
    if (!confirm('حذف هذا البند؟')) return;
    delete activities[id];
    saveAct();
    showMessage('تم الحذف ✅');
}

function editAct(id) {
    const a = activities[id];
    const newName = prompt('اسم البند:', a.name);
    if (!newName) return;
    activities[id].name = newName;
    saveAct();
    showMessage('تم التعديل ✅');
}

// --- إدارة الدورات ---
function loadCyclesManagement() {
    const l = document.getElementById('cyclesList');
    if (!l) return;
    l.innerHTML = cycles.sort((a, b) => b.createdAt - a.createdAt).map(c =>
        `<div class="weakness-card" style="padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; ${c.isActive ? 'border:2px solid #667eea;' : ''}">
            <div><strong>${c.name}</strong><br><small>${c.startDate || ''} - ${c.endDate || ''}</small></div>
            <div>${!c.isActive ? `<button onclick="setCycle('${c.id}')">تفعيل</button>` : '🟢'} <button onclick="delCycle('${c.id}')">🗑️</button></div>
        </div>`
    ).join('');
}

function saveCycles() {
    saveCyclesStorage();
    loadCyclesManagement();
    updateGlobalCycleSelector();
}

function addCycle() {
    const n = document.getElementById('newCycleName').value;
    if (!n) return;
    cycles.forEach(c => c.isActive = false);
    cycles.push({
        id: 'c_' + Date.now(),
        name: n,
        isActive: true,
        createdAt: Date.now(),
        startDate: document.getElementById('cycleStartDate').value,
        endDate: document.getElementById('cycleEndDate').value
    });
    saveCycles();
    showMessage('دورة جديدة ✅');
}

function setCycle(id) {
    cycles.forEach(c => c.isActive = (c.id === id));
    saveCycles();
    updateCurrentPage();
}

function delCycle(id) {
    if (!confirm('حذف الدورة؟')) return;
    cycles = cycles.filter(c => c.id !== id);
    saveCycles();
    showMessage('تم الحذف ✅');
}

// --- الدورة العامة ---
function updateGlobalCycleSelector() {
    const sel = document.getElementById('globalCycleFilter');
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="all">كل الوقت</option><option value="current">الدورة الحالية</option>';
    cycles.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.name + (c.isActive ? ' 🟢' : '');
        sel.appendChild(o);
    });
    if (cur) sel.value = cur;
}

function changeGlobalCycle(val) {
    currentCycleId = val;
    localStorage.setItem('selectedCycleId', val);
    updateCurrentPage();
}

// --- صفحات أخرى ---
function loadUserDetails() {
    const u = document.getElementById('userSelect').value;
    const div = document.getElementById('userHistory');
    if (!u) return;
    const data = getFilteredData().filter(e => e.userName === u).sort((a, b) => b.timestamp - a.timestamp);
    div.innerHTML = data.length > 0
        ? `<table style="width:100%;"><thead><tr><th>التاريخ</th><th>النسبة</th><th>المستوى</th></tr></thead><tbody>${data.map(e => `<tr><td>${new Date(e.date).toLocaleDateString('ar-SA')}</td><td>${e.totalPercentage.toFixed(1)}%</td><td>${e.level}</td></tr>`).join('')}</tbody></table>`
        : '<p>لا توجد بيانات</p>';
}

function loadWeaknessAnalysis() {
    const c = document.getElementById('weaknessAnalysis');
    const fU = document.getElementById('weaknessUserSelect')?.value;
    if (!c) return;
    const data = getFilteredData().filter(e => e.timestamp >= Date.now() - 14 * 24 * 60 * 60 * 1000);
    const targetUsers = fU ? [fU] : users;
    c.innerHTML = targetUsers.map(u => {
        const ud = data.filter(e => e.userName === u);
        if (ud.length === 0) return '';
        const avgs = {};
        Object.keys(activities).forEach(id => {
            avgs[id] = ud.reduce((s, e) => s + (e.scores[id] / activities[id].max), 0) / ud.length * 100;
        });
        const weak = Object.keys(avgs).sort((a, b) => avgs[a] - avgs[b]).slice(0, 3);
        return `<div class="weakness-card"><h3>👤 ${u}</h3>${weak.map(id => `<div class="weakness-item">${activities[id].name}: ${avgs[id].toFixed(1)}%</div>`).join('')}</div>`;
    }).join('') || '<p>لا توجد بيانات كافية للتحليل</p>';
}

// --- التقارير ---
function loadUserReport() {
    currentReportUser = document.getElementById('reportUserSelect')?.value;
    const u = currentReportUser;
    if (!u) return;
    const content = document.getElementById('userReportContent');
    const noData = document.getElementById('noReportData');
    const data = getFilteredData().filter(e => e.userName === u).sort((a, b) => b.timestamp - a.timestamp);

    if (data.length === 0) {
        if (content) content.style.display = 'none';
        if (noData) noData.style.display = 'block';
        return;
    }
    if (content) content.style.display = 'block';
    if (noData) noData.style.display = 'none';

    const last7 = data.slice(0, 7);
    const dailyTable = document.getElementById('dailyReportTable');
    if (dailyTable) {
        dailyTable.innerHTML = `<table style="width:100%;"><thead><tr><th>التاريخ</th><th>النسبة</th><th>المستوى</th></tr></thead><tbody>${last7.map(e => `<tr><td>${new Date(e.date).toLocaleDateString('ar-SA')}</td><td>${e.totalPercentage.toFixed(1)}%</td><td>${e.level}</td></tr>`).join('')}</tbody></table>`;
    }

    const allAvgs = {};
    Object.keys(activities).forEach(id => {
        allAvgs[id] = data.reduce((s, e) => s + ((e.scores?.[id] || 0) / activities[id].max), 0) / data.length * 100;
    });
    const sorted = Object.keys(allAvgs).sort((a, b) => allAvgs[b] - allAvgs[a]);
    const best = document.getElementById('bestActivities');
    const worst = document.getElementById('worstActivities');
    if (best) best.innerHTML = sorted.slice(0, 3).map(id => `<div style="margin:5px 0;">${activities[id].name}: ${allAvgs[id].toFixed(1)}%</div>`).join('');
    if (worst) worst.innerHTML = sorted.slice(-3).reverse().map(id => `<div style="margin:5px 0;">${activities[id].name}: ${allAvgs[id].toFixed(1)}%</div>`).join('');
}

function loadReports() {
    showReport('weekly');
}

function showReport(type) {
    document.querySelectorAll('.report-content').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const tab = document.getElementById(type + 'Report');
    if (tab) tab.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => { if (b.textContent.includes(type === 'weekly' ? 'أسبوعي' : 'شهري')) b.classList.add('active'); });

    if (type === 'weekly') drawWeeklyReportChart();
    else drawMonthlyReportChart();
}

function drawWeeklyReportChart() {
    const ctx = document.getElementById('weeklyReportChart');
    if (!ctx || typeof Chart === 'undefined') return;
    const l = [], v = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        l.push(d.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' }));
        const dd = allData.filter(e => new Date(e.date).toDateString() === d.toDateString());
        v.push(dd.length > 0 ? (dd.reduce((s, x) => s + x.totalPercentage, 0) / dd.length).toFixed(1) : 0);
    }
    if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();
    new Chart(ctx, { type: 'bar', data: { labels: l, datasets: [{ label: 'متوسط الأداء اليومي %', data: v, backgroundColor: 'rgba(102,126,234,0.7)', borderColor: '#667eea', borderWidth: 2 }] }, options: { scales: { y: { beginAtZero: true, max: 100 } } } });
}

function drawMonthlyReportChart() {
    const ctx = document.getElementById('monthlyReportChart');
    if (!ctx || typeof Chart === 'undefined') return;
    const weeks = {};
    allData.forEach(e => {
        const d = new Date(e.date);
        const week = Math.ceil(d.getDate() / 7);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
        if (!weeks[key]) weeks[key] = { sum: 0, count: 0 };
        weeks[key].sum += e.totalPercentage;
        weeks[key].count++;
    });
    const l = Object.keys(weeks).slice(-8);
    const v = l.map(k => (weeks[k].sum / weeks[k].count).toFixed(1));
    if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();
    new Chart(ctx, { type: 'line', data: { labels: l, datasets: [{ label: 'متوسط الأسبوع %', data: v, borderColor: '#764ba2', backgroundColor: 'rgba(118,75,162,0.1)', tension: 0.4, fill: true }] }, options: { scales: { y: { beginAtZero: true, max: 100 } } } });
}

// --- إدارة المستخدمين ---
function renderUserManagementList() {
    const ul = document.getElementById('userManagementList');
    if (!ul) return;
    ul.innerHTML = users.map((u, i) =>
        `<li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #eee; border-radius:8px; margin-bottom:8px;">
            <span>👤 ${u}</span>
            <button onclick="removeUser(${i})" style="background:#ff4d4d; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">🗑️ حذف</button>
        </li>`
    ).join('');
}

function handleAddNewUser() {
    const input = document.getElementById('newUserName');
    const name = input?.value?.trim();
    if (!name) return;
    if (users.includes(name)) { alert('المستخدم موجود بالفعل'); return; }
    users.push(name);
    saveUsers();
    populateAllSelects();
    renderUserManagementList();
    if (input) input.value = '';
    showMessage('تم إضافة المستخدم ✅');
}

function removeUser(index) {
    if (!confirm('حذف المستخدم؟')) return;
    users.splice(index, 1);
    saveUsers();
    populateAllSelects();
    renderUserManagementList();
    showMessage('تم الحذف ✅');
}

// --- حسابات النظام ---
function loadSystemUsers() {
    const l = document.getElementById('systemUsersList');
    if (!l) return;
    l.innerHTML = systemUsers.map(u =>
        `<div class="weakness-card" style="padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${u.name}</strong><br><small>@${u.username} | ${u.role === 'Owner' ? '👑 مالك' : u.role === 'Staff' ? '🔧 مسئول' : '👁️ مشاهد'}</small></div>
            <div>
                <button onclick="editSystemUserPassword('${u.id}')" style="background:#667eea; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:5px;">🔑</button>
                ${u.id !== 'u_admin' ? `<button onclick="deleteSystemUser('${u.id}')" style="background:#ff4d4d; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">🗑️</button>` : ''}
            </div>
        </div>`
    ).join('');
}

function addSystemUser() {
    const name = document.getElementById('sysName')?.value?.trim();
    const username = document.getElementById('sysUsername')?.value?.trim();
    const password = document.getElementById('sysPassword')?.value;
    const role = document.getElementById('sysRole')?.value;
    if (!name || !username || !password) { alert('أدخل جميع البيانات'); return; }
    if (systemUsers.find(u => u.username === username)) { alert('اسم المستخدم موجود'); return; }
    systemUsers.push({ id: 'u_' + Date.now(), name, username, password, role });
    saveSystemUsers();
    loadSystemUsers();
    if (document.getElementById('sysName')) document.getElementById('sysName').value = '';
    if (document.getElementById('sysUsername')) document.getElementById('sysUsername').value = '';
    if (document.getElementById('sysPassword')) document.getElementById('sysPassword').value = '';
    showMessage('تم إضافة الحساب ✅');
}

function deleteSystemUser(id) {
    if (!confirm('حذف الحساب؟')) return;
    systemUsers = systemUsers.filter(u => u.id !== id);
    saveSystemUsers();
    loadSystemUsers();
    showMessage('تم الحذف ✅');
}

function editSystemUserPassword(id) {
    const newPass = prompt('كلمة المرور الجديدة:');
    if (!newPass) return;
    const u = systemUsers.find(u => u.id === id);
    if (u) { u.password = newPass; saveSystemUsers(); showMessage('تم تغيير الرمز ✅'); }
}

function changeAdminPassword() {
    if (!currentUser) return;
    const newPass = prompt('كلمة المرور الجديدة:');
    if (!newPass) return;
    const u = systemUsers.find(u => u.id === currentUser.id);
    if (u) {
        u.password = newPass;
        currentUser.password = newPass;
        saveSystemUsers();
        localStorage.setItem('muhasabaCurrentUser', JSON.stringify(currentUser));
        showMessage('تم تغيير الرمز ✅');
    }
}

// --- تصدير PDF احترافي ---
const pdfOptions = {
    margin: 10,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

function exportDashboardToPDF() {
    if (typeof html2pdf === 'undefined') { alert('مكتبة PDF غير محملة'); return; }

    const f = document.getElementById('dashboardDateFilter');
    const selectedDate = f && f.value ? f.value : new Date().toLocaleDateString('en-CA');
    const displayDate = new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // البيانات
    const done = window.currentDashboardDoneUsers || [];
    const notDone = window.currentDashboardNotDoneUsers || [];
    const avg = document.getElementById('avgScore')?.textContent || '0%';

    let html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 25px; background: white; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4a90e2; padding-bottom: 20px;">
            <h1 style="color: #4a90e2; margin: 0; font-size: 28px;">تقرير المحاسبة اليومية العام</h1>
            <p style="color: #666; font-size: 16px; margin-top: 10px;">التاريخ المستهدف: ${displayDate}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="background: #f0f7ff; padding: 15px; border-radius: 10px; border: 1px solid #4a90e2; text-align: center;">
                <div style="color: #4a90e2; font-size: 14px;">تمت المحاسبة</div>
                <div style="font-size: 24px; font-weight: bold;">${done.length}</div>
            </div>
            <div style="background: #fff5f5; padding: 15px; border-radius: 10px; border: 1px solid #ff4d4d; text-align: center;">
                <div style="color: #ff4d4d; font-size: 14px;">لم تتم المحاسبة</div>
                <div style="font-size: 24px; font-weight: bold;">${notDone.length}</div>
            </div>
            <div style="background: #f6f0ff; padding: 15px; border-radius: 10px; border: 1px solid #764ba2; text-align: center;">
                <div style="color: #764ba2; font-size: 14px;">متوسط الأداء</div>
                <div style="font-size: 24px; font-weight: bold;">${avg}</div>
            </div>
        </div>

        <h3 style="color: #4a90e2; border-right: 4px solid #4a90e2; padding-right: 10px;">📊 جدول الترتيب والنتائج</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px;">
            <thead>
                <tr style="background: #4a90e2; color: white;">
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">#</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">الاسم</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">النسبة</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">المستوى</th>
                </tr>
            </thead>
            <tbody>`;

    if (done.length > 0) {
        done.sort((a, b) => b.totalPercentage - a.totalPercentage).forEach((e, i) => {
            html += `<tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${e.userName}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #4a90e2; font-weight: bold;">${e.totalPercentage.toFixed(1)}%</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${e.level}</td>
            </tr>`;
        });
    } else {
        html += `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #888;">لا توجد بيانات لهذا اليوم</td></tr>`;
    }

    html += `</tbody></table>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3 style="color: #2e7d32; border-right: 4px solid #2e7d32; padding-right: 10px;">✅ الذين أنجزوا المحاسبة</h3>
                <ul style="list-style: none; padding: 0; margin-top: 10px;">
                    ${done.length > 0 ? done.map(u => `<li style="padding: 5px; border-bottom: 1px solid #f0f0f0;">• ${u.userName}</li>`).join('') : '<li style="color:#999;">لا يوجد أحد</li>'}
                </ul>
            </div>
            <div>
                <h3 style="color: #d32f2f; border-right: 4px solid #d32f2f; padding-right: 10px;">⏳ المتبقون (لم يحاسبوا)</h3>
                <ul style="list-style: none; padding: 0; margin-top: 10px;">
                    ${notDone.length > 0 ? notDone.map(u => `<li style="padding: 5px; border-bottom: 1px solid #f0f0f0;">• ${u}</li>`).join('') : '<li style="color:#999;">الجميع أنجز المحاسبة ✅</li>'}
                </ul>
            </div>
        </div>

        <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px;">
            تم توليد هذا التقرير من نظام المحاسبة اليومية | الذاكرون والذاكرات
        </div>
    </div>`;

    html2pdf().set({ ...pdfOptions, filename: `تقرير_لوحة_التحكم_${selectedDate}.pdf` }).from(html).save();
}

function exportRankingToPDF() {
    if (typeof html2pdf === 'undefined') { alert('مكتبة PDF غير محملة'); return; }
    html2pdf().set({ ...pdfOptions, filename: 'تصنيف_المحاسبة.pdf' }).from(document.getElementById('rankingPage')).save();
}

function exportUserReportToPDF() {
    if (typeof html2pdf === 'undefined') { alert('مكتبة PDF غير محملة'); return; }
    if (!currentReportUser) { alert('اختر مستخدماً أولاً'); return; }

    const reportHTML = generateDetailedReportHTML();
    html2pdf().set({ ...pdfOptions, filename: `تقرير_${currentReportUser}.pdf` }).from(reportHTML).save();
}

function generateDetailedReportHTML() {
    const userData = getFilteredData().filter(e => e.userName === currentReportUser);
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayData = userData.find(e => new Date(e.date).toDateString() === d.toDateString());
        last7Days.push({ date: d, data: dayData });
    }

    const activityAverages = {};
    Object.keys(activities).forEach(id => {
        const scores = userData.map(e => ((e.scores[id] || 0) / (activities[id].max || 1)) * 100);
        activityAverages[id] = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    });

    const sortedIds = Object.keys(activityAverages).sort((a, b) => activityAverages[b] - activityAverages[a]);
    const avgTotal = userData.length > 0 ? (userData.reduce((s, e) => s + e.totalPercentage, 0) / userData.length) : 0;

    let html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background: white; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
            <h1 style="color: #667eea; margin: 0; font-size: 26px;">محاسبة يومية - تقرير شامل</h1>
            <h2 style="color: #764ba2; margin: 10px 0; font-size: 20px;">المستخدم: ${currentReportUser}</h2>
            <p style="color: #666; font-size: 14px;">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px; margin-top: 20px;">1. التقرير اليومي (آخر 7 أيام)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #667eea; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">اليوم</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">التاريخ</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">النسبة</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">المستوى</th>
                </tr>
            </thead>
            <tbody>`;

    last7Days.forEach(day => {
        html += `<tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${day.date.toLocaleDateString('ar-SA', { weekday: 'long' })}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${day.date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'numeric' })}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${day.data ? day.data.totalPercentage.toFixed(1) + '%' : '-'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${day.data ? day.data.level : '-'}</td>
        </tr>`;
    });

    html += `</tbody></table>

        <div style="margin: 30px 0; background: #f4f7fe; padding: 15px; border-radius: 10px; border: 1px solid #e0e6ed;">
            <h3 style="color: #667eea; margin-top: 0;">2. ملخص الأداء</h3>
            <p><strong>عدد الأيام المسجلة:</strong> ${userData.length}</p>
            <p><strong>المتوسط العام:</strong> ${avgTotal.toFixed(1)}%</p>
            <p><strong>المستوى العام:</strong> ${getLevel(avgTotal)}</p>
        </div>

        <h3 style="color: #4caf50; border-right: 4px solid #4caf50; padding-right: 10px;">3. نقاط القوة (أفضل 3 عبادات)</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">`;

    sortedIds.slice(0, 3).forEach(id => {
        html += `<div style="background: rgba(76, 175, 80, 0.1); padding: 10px; border-radius: 8px; border: 1px solid #4caf50;">
            <div style="font-weight: bold; font-size: 14px;">${activities[id].name}</div>
            <div style="font-size: 18px; color: #4caf50; font-weight: bold;">${activityAverages[id].toFixed(1)}%</div>
        </div>`;
    });

    html += `</div>

        <h3 style="color: #ff9800; border-right: 4px solid #ff9800; padding-right: 10px; margin-top: 30px;">4. نقاط التحسين (أضعف 3 عبادات)</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">`;

    sortedIds.slice(-3).reverse().forEach(id => {
        html += `<div style="background: rgba(255, 152, 0, 0.1); padding: 10px; border-radius: 8px; border: 1px solid #ff9800;">
            <div style="font-weight: bold; font-size: 14px;">${activities[id].name}</div>
            <div style="font-size: 18px; color: #ff9800; font-weight: bold;">${activityAverages[id].toFixed(1)}%</div>
        </div>`;
    });

    html += `</div>

        <h3 style="color: #667eea; border-right: 4px solid #667eea; padding-right: 10px; margin-top: 30px;">5. تفاصيل جميع العبادات</h3>
        <div style="margin-top: 15px;">`;

    sortedIds.forEach(id => {
        const p = activityAverages[id];
        let color = '#f44336';
        if (p >= 80) color = '#4caf50';
        else if (p >= 60) color = '#ffc107';

        html += `<div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                <span>${activities[id].name}</span>
                <span style="color: ${color};">${p.toFixed(1)}%</span>
            </div>
            <div style="background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: ${color}; width: ${p}%; height: 100%;"></div>
            </div>
        </div>`;
    });

    html += `</div>
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            نظام المحاسبة اليومية - تم توليد التقارير آلياً
        </div>
    </div>`;
    return html;
}

// --- صفحة النموذج ---
function updateUserForm() {
    const u = document.getElementById('userName')?.value;
    const link = document.getElementById('personalLink');
    const linkDisplay = document.getElementById('linkDisplay');
    if (u && link && linkDisplay) {
        link.style.display = 'block';
        // إصلاح الرابط ليناسب GitHub Pages أو أي استضافة أخرى
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        linkDisplay.value = `${baseUrl}?user=${encodeURIComponent(u)}`;
    } else if (link) {
        link.style.display = 'none';
    }
}

function copyLink() {
    const l = document.getElementById('linkDisplay');
    if (l) { l.select(); document.execCommand('copy'); showMessage('تم نسخ الرابط ✅'); }
}

// --- رسائل ---
function showMessage(m) {
    const d = document.createElement('div');
    d.className = 'success-message';
    d.innerHTML = m;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3000);
}

// --- التنقل بين الصفحات ---
function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const idMap = {
        'form': 'formPage',
        'dashboard': 'dashboardPage',
        'userReports': 'userReportsPage',
        'userDetails': 'userDetailsPage',
        'weakness': 'weaknessPage',
        'reportsPage': 'reportsPage',
        'ranking': 'rankingPage',
        'users': 'usersPage',
        'manageActivities': 'activitiesManagementPage',
        'manageCycles': 'cyclesManagementPage',
        'systemUsers': 'systemUsersPage'
    };
    const target = idMap[name];
    if (target && document.getElementById(target)) {
        document.getElementById(target).classList.add('active');
        updateCurrentPage();
    }
}

function updateCurrentPage() {
    const page = document.querySelector('.page.active')?.id;
    if (page === 'dashboardPage') loadDashboard();
    else if (page === 'rankingPage') loadRankingSystem();
    else if (page === 'reportsPage') loadReports();
    else if (page === 'userReportsPage') loadUserReport();
    else if (page === 'weaknessPage') loadWeaknessAnalysis();
    else if (page === 'userDetailsPage') loadUserDetails();
    else if (page === 'usersPage') renderUserManagementList();
    else if (page === 'activitiesManagementPage') loadActivitiesManagement();
    else if (page === 'cyclesManagementPage') loadCyclesManagement();
    else if (page === 'systemUsersPage') loadSystemUsers();
}

// --- تهيئة النظام ---
function initSystem() {
    if (!currentUser && window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
        return;
    }
    updateUserProfileDisplay();
    populateAllSelects();
    applyRolePermissions();
    generateDynamicForms();
    updateGlobalCycleSelector();
    renderUserManagementList();

    const f = document.getElementById('dashboardDateFilter');
    if (f) f.value = new Date().toISOString().split('T')[0];

    const url = new URLSearchParams(window.location.search);
    if (url.get('user') && document.getElementById('userName')) {
        document.getElementById('userName').value = url.get('user');
    }

    loadDashboard();
}

window.addEventListener('DOMContentLoaded', initSystem);
