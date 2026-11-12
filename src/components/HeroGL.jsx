import { useEffect, useRef } from 'react';

export default function HeroGL() {
  const ref = useRef(null);

  useEffect(() => {
    let stop = null;
    let cancelled = false;
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;
    const handle = idle(() => {
      import('../gl/heroShader.js').then(({ startHeroShader }) => {
        if (!cancelled && ref.current) stop = startHeroShader(ref.current);
      }).catch(() => {});
    });
    return () => {
      cancelled = true;
      cancelIdle(handle);
      if (stop) stop();
    };
  }, []);

  return <canvas ref={ref} className="hero-gl" aria-hidden="true" />;
}
