import { supabase } from '../supabase';
import { mergeSettings } from '../defaultSettings';
import { normalizeApp } from './appsLib.js';

const withTimeout = (thenable, ms = 12000) =>
  Promise.race([
    Promise.resolve(thenable),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

/** التطبيقات المنشورة فقط، بترتيب العرض الذي يحدده المسؤول. */
export async function fetchPublishedApps() {
  const { data, error } = await withTimeout(
    supabase
      .from('apps')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
  );
  if (error) throw error;
  return (data || []).map((row) => normalizeApp(row)).filter((a) => a.slug && (a.name.ar || a.name.en));
}

/** محتوى صفحة التطبيقات كما حفظه المسؤول (أو null إن لم يُحفظ شيء بعد). */
export async function fetchAppsPage() {
  const { data, error } = await withTimeout(
    supabase.from('apps_page_settings').select('data').eq('id', 1)
  );
  if (error) throw error;
  return data && data[0] ? data[0].data : null;
}

/** إعدادات الموقع الأساسية (بيانات التواصل) من نفس الجدول الذي تقرأه الصفحة الرئيسية. */
export async function fetchSiteSettings() {
  const { data, error } = await withTimeout(supabase.from('settings').select('data').eq('id', 1));
  if (error) throw error;
  return data && data[0] && data[0].data ? mergeSettings(data[0].data) : null;
}
