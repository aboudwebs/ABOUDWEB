export function AccessNotice({ access }) {
  if (access.status === 'checking') {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-14 text-center text-sm text-zinc-500">جاري التحقق من الصلاحيات...</div>;
  }
  if (access.status === 'denied') {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-8 text-sm leading-7 text-amber-200/90">
        <div className="mb-2 font-semibold text-amber-300">حسابك غير مصرّح له بإدارة التطبيقات</div>
        لإضافة حسابك كمسؤول، شغّل هذا الأمر في Supabase → SQL Editor (بعد وضع بريدك):
        <pre dir="ltr" className="mt-3 overflow-x-auto rounded-xl bg-black/40 p-4 text-left text-xs text-zinc-300">{`insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR_EMAIL'
on conflict do nothing;`}</pre>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-sm leading-7 text-rose-200/90">
      <div className="mb-2 font-semibold text-rose-300">إعداد قاعدة البيانات مطلوب</div>
      لم يتم العثور على جداول وصلاحيات قسم التطبيقات. افتح Supabase → SQL Editor وشغّل محتوى الملف
      <code dir="ltr" className="mx-1 rounded bg-black/40 px-1.5 py-0.5 text-xs">supabase/apps_setup.sql</code>
      الموجود في المشروع مرة واحدة، ثم أعد تحميل هذه الصفحة.
      {access.error && <div dir="ltr" className="mt-3 text-left text-xs text-rose-300/70">{access.error}</div>}
    </div>
  );
}
