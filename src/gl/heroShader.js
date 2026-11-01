const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const frag = (oct, deriv) => `${deriv ? '#extension GL_OES_standard_derivatives : enable\n' : ''}
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform vec2 m;uniform float t;uniform float s;uniform float d;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<${oct};i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 u=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  float f=fbm((p+(m-.5)*vec2(.1,-.1))*1.5+vec2(t*.06,-t*.04)+s*.5);
  float k=f*11.;
  float g=abs(fract(k)-.5);
  ${deriv ? 'float w=fwidth(k)*.9+.001;' : 'float w=.05;'}
  float l=1.-smoothstep(w*.5,w*1.5,g);
  float vig=smoothstep(1.2,.15,length(p*vec2(.8,1.)));
  vec2 mm=vec2(m.x,1.-m.y);
  float gl=exp(-pow(length((u-mm)*vec2(r.x/r.y,1.)),2.)*7.);
  vec3 c=mix(vec3(.31,.275,.9),vec3(.506,.549,.973),d);
  c=mix(c,vec3(1.),gl*.45*d);
  float a=l*(.09+.3*gl)*vig*mix(.85,1.,d)+smoothstep(.45,.78,f)*.045*vig;
  gl_FragColor=vec4(c*a,a);
}`;

export function startHeroShader(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: true, powerPreference: 'low-power'
  });
  if (!gl) return null;

  const small = window.innerWidth < 768;
  const deriv = !!gl.getExtension('OES_standard_derivatives');
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, frag(small ? 3 : 4, deriv));
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (name) => gl.getUniformLocation(prog, name);
  const uR = U('r'), uT = U('t'), uS = U('s'), uD = U('d'), uM = U('m');

  const root = document.documentElement;
  const host = canvas.parentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
  let w = 2, h = 2, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  let dark = root.classList.contains('dark') ? 1 : 0;
  let raf = 0, last = 0, slow = 0, visible = true, ready = false, dead = false;
  const t0 = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(2, Math.round(rect.width * dpr));
    h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };

  const draw = (now) => {
    raf = 0;
    if (dead) return;
    const dt = now - last;
    last = now;
    if (dt > 34) slow++; else slow = Math.max(0, slow - 1);
    if (slow > 24 && dpr > 0.75) { dpr = Math.max(0.75, dpr - 0.25); slow = 0; resize(); }
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    const target = root.classList.contains('dark') ? 1 : 0;
    dark = reduce.matches ? target : dark + (target - dark) * 0.1;
    const scroll = parseFloat(host.style.getPropertyValue('--hero-scroll')) || 0;
    gl.uniform2f(uR, w, h);
    gl.uniform2f(uM, mx, my);
    gl.uniform1f(uT, reduce.matches ? 12 : (now - t0) / 1000);
    gl.uniform1f(uS, scroll);
    gl.uniform1f(uD, dark);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) { ready = true; canvas.classList.add('is-ready'); }
    if (!reduce.matches) raf = requestAnimationFrame(draw);
  };

  const kick = () => {
    if (dead || raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(draw);
  };
  const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    tx = e.clientX / window.innerWidth;
    ty = e.clientY / window.innerHeight;
  };
  const onResize = () => { resize(); kick(); };
  const onVisibility = () => (document.hidden ? halt() : kick());
  const onLost = (e) => { e.preventDefault(); halt(); canvas.classList.remove('is-ready'); };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) kick(); else halt();
  });
  const mo = new MutationObserver(kick);

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);
  reduce.addEventListener('change', kick);
  io.observe(host);
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });

  resize();
  kick();

  return () => {
    dead = true;
    halt();
    io.disconnect();
    mo.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
    reduce.removeEventListener('change', kick);
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  };
}
