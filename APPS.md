# Aboud Web | Apps — دليل سريع

صفحة `/apps` ولوحة إدارتها مبنيتان على نفس مشروع الموقع (Vite + React + Tailwind + Supabase) دون مكتبات جديدة.

## الإعداد (مرة واحدة)

1. افتح Supabase → **SQL Editor** → New query.
2. افتح الملف `supabase/apps_setup.sql`، **غيّر `PUT_YOUR_ADMIN_EMAIL_HERE` إلى بريد حسابك** في لوحة التحكم، ثم الصق الملف كاملاً واضغط Run.
   (يُنشئ جدول `apps` وجدول `apps_page_settings` ومساحة تخزين الصور `app-media` وسياسات الأمان. آمن لإعادة التشغيل.)
3. ادخل إلى `/admin.html` ← تبويب **إدارة التطبيقات**.

أي حساب غير مضاف في `admin_users` لا يستطيع إضافة تطبيق أو رفع صورة، حتى لو سجّل الدخول.
لإضافة مسؤول آخر لاحقاً:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'other@example.com' on conflict do nothing;
```

## المسارات

| المسار | المحتوى |
| --- | --- |
| `/apps` | القسم الرئيسي + التطبيقات المنشورة + التواصل |
| `/apps/<slug>` | صفحة تفاصيل التطبيق (مثل `/apps/waynha`) |

* `apps/index.html` مدخل مستقل حتى يعمل `/apps` مباشرةً على أي استضافة ثابتة.
* **الاستضافة: Render (Static Site).** `/apps` و`/apps/` يعملان تلقائياً. أما الدخول المباشر على `/apps/<slug>` (مثل `/apps/waynha`) فيحتاج قاعدة واحدة تُضاف مرة واحدة من لوحة Render:
  الخدمة ← **Redirects/Rewrites** ← Add Rule ← Source: `/apps/*` — Destination: `/index.html` — Action: **Rewrite**.
  (Render لا يقرأ `vercel.json` ولا `_redirects`، ولا يطبّق القاعدة على مسار فيه ملف موجود، فلا تتعارض مع `/apps` نفسه.)
  وإن كنت تستخدم Blueprint (`render.yaml`) أضف تحت الخدمة:

  ```yaml
  routes:
    - type: rewrite
      source: /apps/*
      destination: /index.html
  ```

## إضافة تطبيق جديد

من لوحة التحكم فقط (بدون تعديل كود): **إدارة التطبيقات ← إضافة تطبيق**.
التطبيق الجديد يبدأ **مخفياً**؛ استخدم «معاينة صفحة التفاصيل» ثم فعّل النشر.
أزرار التحميل تظهر للزوار فقط عندما تكون الحالة «متاح للتحميل» ويوجد رابط https صالح.

## هيكل الكود

```
src/apps/         الصفحة العامة (AppsApp, AppsHome, AppCard, AppDetail, appsLib.js, appsDefaults.js, apps.css)
src/admin-apps/   إدارة التطبيقات ومحتوى الصفحة داخل لوحة التحكم
src/Root.jsx      يقرر بين الموقع الرئيسي وصفحة التطبيقات حسب المسار (تحميل كسول)
supabase/apps_setup.sql   الجداول والتخزين والصلاحيات
```
