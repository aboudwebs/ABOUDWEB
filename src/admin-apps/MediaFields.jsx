import { useRef } from 'react';
import { MAX_SCREENSHOTS, validateImageFile } from './appsAdminApi';

const newKey = () => Math.random().toString(36).slice(2, 9);

// الأيقونة: { url, file, preview } أو null — الصور: مصفوفة من { key, url, file, preview }
// الملفات الجديدة تُرفع فقط عند الضغط على «حفظ»، والمعاينة محلية قبل ذلك.
export function MediaFields({ icon, shots, setIcon, setShots, notify }) {
  const iconInput = useRef(null);
  const shotsInput = useRef(null);

  const revoke = (item) => {
    if (item?.file && item.preview) URL.revokeObjectURL(item.preview);
  };

  const onIcon = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = validateImageFile(file);
    if (err) return notify(err);
    revoke(icon);
    setIcon({ url: '', file, preview: URL.createObjectURL(file) });
  };

  const onShots = (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    const room = MAX_SCREENSHOTS - shots.length;
    if (room <= 0) return notify(`الحد الأقصى ${MAX_SCREENSHOTS} صور.`);
    const accepted = [];
    for (const file of files.slice(0, room)) {
      const err = validateImageFile(file);
      if (err) { notify(`${file.name}: ${err}`); continue; }
      accepted.push({ key: newKey(), url: '', file, preview: URL.createObjectURL(file) });
    }
    if (files.length > room) notify(`تمت إضافة ${room} صور فقط (الحد الأقصى ${MAX_SCREENSHOTS}).`);
    if (accepted.length) setShots([...shots, ...accepted]);
  };

  const removeShot = (key) => {
    revoke(shots.find((s) => s.key === key));
    setShots(shots.filter((s) => s.key !== key));
  };

  const moveShot = (index, dir) => {
    const next = [...shots];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setShots(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="admin-label">أيقونة التطبيق</label>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 grid place-items-center text-xs text-zinc-600" data-testid="icon-preview">
            {icon?.preview ? <img src={icon.preview} alt="" className="h-full w-full object-cover" /> : 'لا توجد'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => iconInput.current?.click()} className="h-10 rounded-xl bg-zinc-800 px-4 text-xs text-zinc-100 hover:bg-zinc-700">
              {icon?.preview ? 'تغيير الأيقونة' : 'رفع أيقونة'}
            </button>
            {icon?.preview && (
              <button type="button" onClick={() => { revoke(icon); setIcon(null); }} className="h-10 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-xs text-rose-400">
                إزالة
              </button>
            )}
          </div>
          <input ref={iconInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={onIcon} data-testid="icon-input" />
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">صورة مربعة (512×512 مثالية). PNG أو JPG أو WebP، حتى 5 ميغابايت.</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="admin-label !mb-0">صور التطبيق ({shots.length}/{MAX_SCREENSHOTS})</label>
          <button type="button" onClick={() => shotsInput.current?.click()} disabled={shots.length >= MAX_SCREENSHOTS} className="h-9 rounded-xl bg-zinc-800 px-3 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-40">
            إضافة صور
          </button>
        </div>
        <input ref={shotsInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={onShots} data-testid="shots-input" />
        {shots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">لم تُضف صور بعد.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" data-testid="shots-grid">
            {shots.map((shot, i) => (
              <div key={shot.key} className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                <img src={shot.preview} alt="" className="h-full w-full object-cover" />
                {shot.file && <span className="absolute top-1.5 start-1.5 rounded-md bg-indigo-500/80 px-1.5 py-0.5 text-[9px] text-white">جديدة</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveShot(i, -1)} disabled={i === 0} aria-label="تقديم الصورة" className="h-7 w-7 rounded-lg bg-black/60 text-xs text-white disabled:opacity-30">→</button>
                    <button type="button" onClick={() => moveShot(i, 1)} disabled={i === shots.length - 1} aria-label="تأخير الصورة" className="h-7 w-7 rounded-lg bg-black/60 text-xs text-white disabled:opacity-30">←</button>
                  </div>
                  <button type="button" onClick={() => removeShot(shot.key)} aria-label="حذف الصورة" className="h-7 w-7 rounded-lg bg-rose-500/80 text-xs text-white">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-zinc-500">يظهر ترتيب الصور هنا كما سيظهر للزوار. الصور تُرفع عند الضغط على «حفظ».</p>
      </div>
    </div>
  );
}
