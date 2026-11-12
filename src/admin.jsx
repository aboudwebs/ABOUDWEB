import React, { useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabase';
import './index.css';
import AppsManager from './admin-apps/AppsManager.jsx';
import AppsPageEditor from './admin-apps/AppsPageEditor.jsx';
import { useAppsAccess } from './admin-apps/useAppsAccess.js';

function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectMsg, setProjectMsg] = useState('');
  const [search, setSearch] = useState('');
  // أقسام لوحة التحكم: المشاريع (الأصلي) + إدارة التطبيقات + محتوى صفحة التطبيقات
  const [section, setSection] = useState(() => (window.location.hash === '#apps' ? 'apps' : window.location.hash === '#apps-page' ? 'apps-page' : 'projects'));
  const appsAccess = useAppsAccess(session);
  const changeSection = (id) => {
    setSection(id);
    window.history.replaceState(null, '', id === 'projects' ? window.location.pathname + window.location.search : `#${id}`);
    window.scrollTo({ top: 0 });
  };

  const emptyProject = { title_ar:'', title_en:'', category:'ecommerce', live_url:'', image_url:'', desc_ar:'', desc_en:'' };
  const [projectForm, setProjectForm] = useState(emptyProject);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchProjects(); }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase.from('projects').select('*').order('id', { ascending:true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setProjectMsg('خطأ أثناء تحميل المشاريع: ' + err.message);
    } finally { setLoadingProjects(false); }
  };

  const resetForm = () => { setEditingProject(null); setProjectForm(emptyProject); };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    setProjectMsg('');
    const payload = {
      title: projectForm.title_ar || projectForm.title_en || '',
      title_ar: projectForm.title_ar.trim(),
      title_en: projectForm.title_en.trim(),
      desc_ar: projectForm.desc_ar.trim(),
      desc_en: projectForm.desc_en.trim(),
      category: projectForm.category,
      live_url: projectForm.live_url.trim(),
      image_url: projectForm.image_url.trim()
    };
    try {
      if (editingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
        if (error) throw error;
        setProjectMsg('تم تحديث المشروع بنجاح');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        setProjectMsg('تمت إضافة المشروع بنجاح');
      }
      resetForm();
      await fetchProjects();
      setTimeout(() => setProjectMsg(''), 2500);
    } catch (err) {
      setProjectMsg('خطأ: ' + err.message);
    } finally { setSavingProject(false); }
  };

  const editProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title_ar: project.title_ar || project.title || '',
      title_en: project.title_en || project.title || '',
      category: project.category || 'ecommerce',
      live_url: project.live_url || project.url || '',
      image_url: project.image_url || project.cover_image || '',
      desc_ar: project.desc_ar || '',
      desc_en: project.desc_en || ''
    });
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const deleteProject = async (id) => {
    if (!window.confirm('هل تريد حذف هذا المشروع نهائياً؟')) return;
    setProjectMsg('جاري حذف المشروع...');
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setProjectMsg('خطأ: ' + error.message); return; }
    if (editingProject?.id === id) resetForm();
    setProjects((current) => current.filter((project) => project.id !== id));
    setProjectMsg('تم حذف المشروع');
    setTimeout(() => setProjectMsg(''), 2500);
  };

  const getCategoryLabel = (category) => ({
    ecommerce:'متجر إلكتروني',
    corporate:'شركة / مؤسسة',
    landing:'صفحة هبوط'
  }[category] || category || 'غير مصنف');

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [project.title_ar, project.title_en, project.title, project.category]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 font-arabic">جاري التحميل...</div>;

  if (!session) return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 font-arabic">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 h-12 w-12 rounded-2xl bg-white text-zinc-950 grid place-items-center font-black text-xl">Q</div>
          <p className="text-[10px] tracking-[.28em] text-zinc-500 mb-3">QAMVIR</p>
          <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h1>
          <p className="text-sm text-zinc-400">سجّل الدخول لإدارة معرض الأعمال والتطبيقات.</p>
        </div>
        {authError && <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{authError}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="admin-input" placeholder="البريد الإلكتروني" />
          <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="admin-input" placeholder="كلمة المرور" />
          <button type="submit" className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-xl transition-all">دخول</button>
        </form>
        <a href="/" className="block mt-7 text-center text-xs text-zinc-500 hover:text-white">العودة للموقع</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-arabic">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white text-zinc-950 grid place-items-center font-black">Q</div>
            <div><div className="font-bold text-sm">QAMVIR</div><div className="text-[10px] text-zinc-500 tracking-[.16em]">ADMIN PANEL</div></div>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white">معاينة</a>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400">خروج</button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto" aria-label="أقسام لوحة التحكم">
          {[['projects', 'معرض المشاريع'], ['apps', 'إدارة التطبيقات'], ['apps-page', 'محتوى صفحة التطبيقات']].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => changeSection(id)}
              aria-current={section === id ? 'page' : undefined}
              data-testid={`tab-${id}`}
              className={`h-11 shrink-0 border-b-2 px-4 text-sm transition-colors ${section === id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {section !== 'projects' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {section === 'apps' ? <AppsManager access={appsAccess} /> : <AppsPageEditor access={appsAccess} />}
        </main>
      )}

      {section === 'projects' && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[.24em] text-zinc-500 mb-3"><span className="h-px w-6 bg-zinc-600"/>PORTFOLIO</div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">معرض المشاريع</h1>
            <p className="mt-2 text-sm text-zinc-500">إضافة، تعديل، وحذف المشاريع الظاهرة على الموقع.</p>
          </div>
          <div className="text-xs text-zinc-400"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400 ml-2"/> {projects.length} مشروع</div>
        </div>

        {projectMsg && <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300">{projectMsg}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)] gap-6 items-start">
          <section className="xl:sticky xl:top-24 bg-zinc-900/55 border border-zinc-800/80 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between mb-6">
              <div><div className="text-[10px] tracking-[.2em] text-zinc-500 mb-2">{editingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}</div><h2 className="text-lg font-semibold text-white">{editingProject ? 'تعديل المشروع' : 'إضافة مشروع'}</h2></div>
              {editingProject && <button type="button" onClick={resetForm} className="text-xs text-zinc-500 hover:text-white">إلغاء</button>}
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div><label className="admin-label">اسم المشروع — عربي</label><input required value={projectForm.title_ar} onChange={(e)=>setProjectForm({...projectForm,title_ar:e.target.value})} className="admin-input" placeholder="مثال: متجر فيرساتشي"/></div>
              <div><label className="admin-label">اسم المشروع — English</label><input required value={projectForm.title_en} onChange={(e)=>setProjectForm({...projectForm,title_en:e.target.value})} className="admin-input dir-ltr text-left" placeholder="e.g. Versace Store"/></div>
              <div><label className="admin-label">التصنيف</label><select value={projectForm.category} onChange={(e)=>setProjectForm({...projectForm,category:e.target.value})} className="admin-input"><option value="ecommerce">متجر إلكتروني</option><option value="corporate">شركة / مؤسسة</option><option value="landing">صفحة هبوط</option></select></div>
              <div><label className="admin-label">رابط الموقع</label><input type="url" value={projectForm.live_url} onChange={(e)=>setProjectForm({...projectForm,live_url:e.target.value})} className="admin-input dir-ltr text-left" placeholder="https://example.com"/></div>
              <div><label className="admin-label">رابط صورة المشروع</label><input type="url" value={projectForm.image_url} onChange={(e)=>setProjectForm({...projectForm,image_url:e.target.value})} className="admin-input dir-ltr text-left" placeholder="https://..."/></div>
              <div><label className="admin-label">الوصف — عربي</label><textarea required rows="3" value={projectForm.desc_ar} onChange={(e)=>setProjectForm({...projectForm,desc_ar:e.target.value})} className="admin-input resize-none" placeholder="وصف مختصر يظهر في المشروع."/></div>
              <div><label className="admin-label">الوصف — English</label><textarea required rows="3" value={projectForm.desc_en} onChange={(e)=>setProjectForm({...projectForm,desc_en:e.target.value})} className="admin-input resize-none dir-ltr text-left" placeholder="Short project description."/></div>
              <button type="submit" disabled={savingProject} className="w-full py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 disabled:opacity-50">{savingProject ? 'جاري الحفظ...' : editingProject ? 'حفظ التعديلات' : 'إضافة المشروع'}</button>
            </form>
          </section>

          <section>
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={(e)=>setSearch(e.target.value)} className="admin-input h-11" placeholder="ابحث باسم المشروع..."/>
              <button type="button" onClick={fetchProjects} className="h-11 px-4 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 hover:text-white">تحديث</button>
            </div>

            {loadingProjects ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-14 text-center text-sm text-zinc-500">جاري تحميل المشاريع...</div> :
             filteredProjects.length === 0 ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-14 text-center"><div className="text-white font-medium mb-2">{projects.length ? 'لا توجد نتائج' : 'لا توجد مشاريع بعد'}</div><div className="text-xs text-zinc-500">{projects.length ? 'جرّب كلمة بحث مختلفة.' : 'أضف أول مشروع من النموذج.'}</div></div> :
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => {
                const cover=project.image_url||project.cover_image;
                const titleAr=project.title_ar||project.title||'بدون اسم';
                const titleEn=project.title_en||project.title||'';
                const liveUrl=project.live_url||project.url||'';
                return <article key={project.id} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/55 hover:border-zinc-700">
                  <div className="relative aspect-[16/9] bg-zinc-950 overflow-hidden">
                    {cover ? <img src={cover} alt={titleAr} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" onError={(e)=>{e.currentTarget.style.opacity='0'}}/> : <div className="w-full h-full grid place-items-center text-xs text-zinc-600">لا توجد صورة</div>}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-[10px] text-zinc-200">{getCategoryLabel(project.category)}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-white truncate">{titleAr}</h3><p className="mt-1 text-[11px] text-zinc-500 truncate dir-ltr text-left">{titleEn}</p></div><span className="text-[10px] text-zinc-600">#{project.id}</span></div>
                    <p className="mt-3 text-xs leading-6 text-zinc-500 line-clamp-2">{project.desc_ar||'بدون وصف'}</p>
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex gap-2">
                      <button type="button" onClick={()=>editProject(project)} className="flex-1 h-9 rounded-lg bg-zinc-800 text-xs text-zinc-200 hover:bg-zinc-700">تعديل</button>
                      <button type="button" onClick={()=>deleteProject(project.id)} className="h-9 px-4 rounded-lg border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 hover:bg-rose-500/15">حذف</button>
                      {liveUrl && <a href={liveUrl} target="_blank" rel="noreferrer" className="h-9 px-3 grid place-items-center rounded-lg border border-zinc-800 text-xs text-zinc-500 hover:text-white">↗</a>}
                    </div>
                  </div>
                </article>;
              })}
             </div>}
          </section>
        </div>
      </main>
      )}

      <style>{`
        .admin-label{display:block;margin-bottom:.45rem;font-size:.72rem;font-weight:500;color:#a1a1aa}
        .admin-input{width:100%;padding:.75rem 1rem;background:#09090b;border:1px solid #27272a;border-radius:.75rem;color:#fff;font-size:.875rem;outline:none;transition:border-color .2s,box-shadow .2s}
        .admin-input:focus{border-color:#52525b;box-shadow:0 0 0 3px rgba(255,255,255,.035)}
        .admin-input::placeholder{color:#52525b}
      `}</style>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDashboard />
  </StrictMode>
);
