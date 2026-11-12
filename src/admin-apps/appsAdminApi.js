import { supabase } from '../supabase';

export const BUCKET = 'app-media';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_SCREENSHOTS = 8;
export const ALLOWED_IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES[file.type]) return 'نوع الملف غير مدعوم. المسموح: PNG وJPG وWebP وGIF وAVIF.';
  if (file.size > MAX_IMAGE_BYTES) return 'حجم الصورة أكبر من 5 ميغابايت.';
  return '';
}

/** يحوّل أخطاء Supabase التقنية إلى رسالة عربية واضحة. */
export function explainError(err) {
  const msg = String(err?.message || err || '');
  const code = String(err?.code || '');
  if (code === '23505' || /duplicate key/i.test(msg)) return 'رابط التطبيق (slug) مستخدم لتطبيق آخر. اختر رابطاً مختلفاً.';
  if (code === '42501' || /row-level security|permission denied|not authorized/i.test(msg)) {
    return 'ليست لديك صلاحية لهذه العملية. تأكد أن حسابك مضاف إلى المسؤولين (admin_users).';
  }
  if (code === '23514' || /violates check constraint/i.test(msg)) {
    return 'إحدى القيم لا تحقق الشروط: تأكد أن كل الروابط تبدأ بـ https:// وأن النصوص ضمن الحد المسموح.';
  }
  if (/bucket not found/i.test(msg)) return 'مساحة تخزين الصور app-media غير موجودة. شغّل ملف supabase/apps_setup.sql أولاً.';
  if (code === '42P01' || code === 'PGRST205' || /does not exist|could not find the table/i.test(msg)) {
    return 'جداول التطبيقات غير موجودة بعد. شغّل ملف supabase/apps_setup.sql في Supabase.';
  }
  if (/maximum allowed size|payload too large/i.test(msg)) return 'حجم الصورة أكبر من الحد المسموح.';
  if (/mime type|not supported/i.test(msg)) return 'نوع الصورة غير مسموح به في مساحة التخزين.';
  if (/failed to fetch|networkerror|timeout/i.test(msg)) return 'تعذّر الاتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.';
  return msg || 'حدث خطأ غير متوقع.';
}

// ---------- التطبيقات ----------

export async function listApps() {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertApp(payload) {
  const { error } = await supabase.from('apps').insert([payload]);
  if (error) throw error;
}

// select('id') يكشف الحالة التي ترفض فيها سياسات الأمان التعديل بصمت (0 صفوف) فلا نعرض «تم الحفظ» زوراً.
export async function updateApp(id, payload) {
  const { data, error } = await supabase.from('apps').update(payload).eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('لم يُحفظ التعديل: لا تملك صلاحية، أو أن التطبيق لم يعد موجوداً.');
}

export async function removeApp(id) {
  const { data, error } = await supabase.from('apps').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('لم يُحذف التطبيق: لا تملك صلاحية، أو أنه محذوف مسبقاً.');
}

export async function reorderApps(orderedIds) {
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from('apps').update({ sort_order: index }).eq('id', id).select('id'))
  );
  const failed = results.find((r) => r.error || !r.data || r.data.length === 0);
  if (failed) throw failed.error || new Error('تعذّر حفظ الترتيب الجديد.');
}

// ---------- محتوى الصفحة ----------

export async function savePageData(data) {
  const { data: rows, error } = await supabase
    .from('apps_page_settings')
    .upsert({ id: 1, data }, { onConflict: 'id' })
    .select('id');
  if (error) throw error;
  if (!rows || rows.length === 0) throw new Error('لم يُحفظ المحتوى: لا تملك صلاحية.');
}

// ---------- الصور (Supabase Storage) ----------

const rand = () => Math.random().toString(36).slice(2, 8);

export async function uploadImage(appId, file, kind) {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  const path = `${appId}/${kind}-${Date.now()}-${rand()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function pathFromPublicUrl(url) {
  const m = String(url || '').match(/\/storage\/v1\/object\/public\/app-media\/([^?#]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

/** حذف ملفات الصور من التخزين (يتجاهل أي رابط ليس من مساحة app-media). */
export async function removeImages(urls) {
  const paths = [...new Set((urls || []).map(pathFromPublicUrl).filter(Boolean))];
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}
