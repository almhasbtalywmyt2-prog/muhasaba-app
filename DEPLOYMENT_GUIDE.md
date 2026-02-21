# 🚀 دليل نشر التطبيق على Netlify

## الطريقة الأولى: Drag & Drop (الأسهل والأسرع) ⭐

### الخطوات:

#### 1️⃣ إنشاء حساب على Netlify
1. اذهب إلى [netlify.com](https://www.netlify.com)
2. اضغط **"Sign up"**
3. سجّل باستخدام:
   - GitHub (موصى به)
   - GitLab
   - Bitbucket
   - أو Email

#### 2️⃣ رفع المشروع
1. بعد تسجيل الدخول، ستجد صفحة بها منطقة **"Drag and drop"**
2. افتح مجلد المشروع: `C:\Users\apk\.gemini\antigravity\scratch\muhasaba-app`
3. **اسحب المجلد كاملاً** وأفلته في المنطقة المخصصة
4. انتظر حتى يكتمل الرفع (عادة 10-30 ثانية)

#### 3️⃣ الحصول على الرابط
بعد اكتمال الرفع، ستحصل على رابط مثل:
```
https://random-name-12345.netlify.app
```

#### 4️⃣ تخصيص الرابط (اختياري)
1. اضغط **"Site settings"**
2. اضغط **"Change site name"**
3. اختر اسم مثل: `muhasaba-app`
4. الرابط الجديد: `https://muhasaba-app.netlify.app`

---

## الطريقة الثانية: عبر GitHub (للتحديثات التلقائية)

### الخطوات:

#### 1️⃣ رفع المشروع إلى GitHub
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/muhasaba-app.git
git push -u origin main
```

#### 2️⃣ ربط Netlify بـ GitHub
1. في Netlify، اضغط **"Add new site"** → **"Import an existing project"**
2. اختر **"GitHub"**
3. اختر المشروع `muhasaba-app`
4. اضغط **"Deploy site"**

---

## الروابط بعد النشر

### للمستخدمين (المحاسبة اليومية):
```
https://your-app-name.netlify.app/
```
أو مع اسم المستخدم:
```
https://your-app-name.netlify.app/?user=بلال طاهر
```

### للمسؤول (لوحة التحكم):
```
https://your-app-name.netlify.app/login.html
```
كلمة المرور: `admin123`

---

## ✅ التحقق من النشر

بعد النشر، تأكد من:
- [ ] فتح الرابط الرئيسي
- [ ] اختيار مستخدم وإدخال بيانات
- [ ] فتح رابط المسؤول وتسجيل الدخول
- [ ] عرض التقارير
- [ ] تصدير PDF

---

## 🔄 التحديثات المستقبلية

### إذا استخدمت Drag & Drop:
1. افتح موقعك في Netlify
2. اضغط **"Deploys"**
3. اسحب المجلد المحدث مرة أخرى

### إذا استخدمت GitHub:
```bash
# بعد التعديلات
git add .
git commit -m "Update"
git push
# سيتم النشر تلقائياً!
```

---

## 🎯 المميزات

✅ **رابط دائم ومجاني**
✅ **HTTPS آمن**
✅ **سرعة عالية**
✅ **لا حاجة لسيرفر**
✅ **تحديثات سهلة**

---

## 📱 مشاركة الروابط

بعد النشر، يمكنك:
1. إرسال الرابط الرئيسي للمستخدمين
2. كل مستخدم يفتح الرابط ويختار اسمه
3. أو إرسال رابط مخصص لكل مستخدم:
   - `https://your-app.netlify.app/?user=بلال طاهر`
   - `https://your-app.netlify.app/?user=صالح العواوي`

---

**جاهز للنشر! 🚀**
