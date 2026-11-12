import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

/**
 * يتحقق أن الحساب المسجَّل دخوله مصرّح له بإدارة التطبيقات (جدول admin_users عبر الدالة qamvir_is_admin).
 * status: checking | ok | denied | setup (ملف الإعداد لم يُشغَّل بعد)
 */
export function useAppsAccess(session) {
  const [state, setState] = useState({ status: 'checking', error: '' });
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    (async () => {
      setState({ status: 'checking', error: '' });
      const { data, error } = await supabase.rpc('qamvir_is_admin');
      if (!alive) return;
      if (error) setState({ status: 'setup', error: error.message || String(error) });
      else setState({ status: data === true ? 'ok' : 'denied', error: '' });
    })();
    return () => { alive = false; };
  }, [userId]);

  return state;
}
