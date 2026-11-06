// Emil Mariya Benny — portfolio interactions & animations
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const body = document.body;

  // ---- loader: count to 100, then lift the curtain and start the hero ----
  const loader = $('#loader');
  function start() {
    body.classList.add('ready'); body.classList.remove('locked');
    requestAnimationFrame(revealVisible); setTimeout(revealVisible, 300);
    setTimeout(() => $$('[data-count]').forEach(count), 900);
    setTimeout(type, 1600);
  }
  let started = false;
  const go = () => { if (started) return; started = true; loader.classList.add('done'); start(); setTimeout(() => loader.remove(), 1400); };
  if (reduce) { loader.remove(); body.classList.add('ready'); }
  else {
    body.classList.add('locked');
    const t0 = performance.now(), dur = 1400, n = $('#ldn'), b = $('#ldb');
    (function step(t) {
      const k = Math.max(0, Math.min(1, (t - t0) / dur)), v = Math.round(100 * (1 - Math.pow(1 - k, 2)));
      n.textContent = v; b.style.width = v + '%';
      if (k < 1) return requestAnimationFrame(step);
      setTimeout(go, 200);
    })(t0);
    setTimeout(go, 2600);  // never leave the page behind the loader
  }

  // ---- particle field: aqua / blue / green sparks with faint links ----
  const cv = $('#field'), ctx = cv.getContext('2d');
  const COLORS = ['46,242,217', '59,155,255', '62,224,138', '220,245,250'];
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, W * H / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.5 + .3, c: COLORS[Math.floor(Math.random() * 4)], ph: Math.random() * 6
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 130 && d > 0) { p.x += dx / d * 1.1; p.y += dy / d * 1.1; }
      const a = .45 + .4 * Math.sin((t || 0) / 700 + p.ph);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(${p.c},${a})`; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], e = Math.hypot(p.x - q.x, p.y - q.y);
        if (e < 120) {
          ctx.strokeStyle = `rgba(120,230,240,${.08 * (1 - e / 120)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  size(); addEventListener('resize', size);
  if (!reduce) requestAnimationFrame(draw);

  // ---- split section headings into words that rise in ----
  function split(el) {
    let i = 0;
    (function walk(node) {
      [...node.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
  }
  if (!reduce) $$('.section h2').forEach(h => { split(h); if (!h.closest('.reveal')) h.classList.add('reveal-words'); });

  // ---- reveal on scroll ----
  $$('.stagger').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const targets = $$('.reveal, .stagger, .reveal-words, .eyebrow');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
  if (reduce) targets.forEach(el => el.classList.add('in'));
  // fallback: reveal whatever is on screen (deep links, scroll while the loader is up)
  function revealVisible() {
    targets.forEach(el => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight - 40 && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); }
    });
  }

  // ---- counters ----
  function count(el) {
    const end = +el.dataset.count, t0 = Date.now(), dur = 1800;
    (function step() {
      const k = Math.max(0, Math.min(1, (Date.now() - t0) / dur)), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v; if (k < 1) setTimeout(step, 30);
    })();
  }
  if (reduce) $$('[data-count]').forEach(el => el.textContent = el.dataset.count);

  // ---- typed role line ----
  const roles = ['Business Development & Structuring Specialist', 'AI Integration, Data Strategy', 'Executive Assistant to MD', 'Executive Customer Support Specialist', 'HR & Talent Acquisition', 'Digital Marketing', 'I build with AI'];
  const typed = $('#typed');
  function type() {
    if (reduce) return;
    let r = 0, i = roles[0].length, del = true;
    (function tick() {
      const word = roles[r];
      i += del ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let wait = del ? 28 : 55;
      if (!del && i === word.length) { del = true; wait = 2600; }
      else if (del && i === 0) { del = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }
  if (reduce) typed.textContent = roles[0];

  // ---- pointer effects: cursor, magnetic buttons, tilt, spotlight ----
  const spots = $$('.pillar, .m-card, .cred, .c-card, .principles, .vol li, .flag');
  spots.forEach(el => el.classList.add('spot'));
  if (fine && !reduce) {
    const cur = $('.cursor'), dot = $('.cursor-dot');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; mouse.x = tx; mouse.y = ty; cur.classList.add('on'); dot.style.transform = `translate(${tx}px,${ty}px)`; });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    (function loop() { cx += (tx - cx) * .16; cy += (ty - cy) * .16; cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    $$('a,button,.pillar,.m-card,.skill-cloud span,.mega span').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
    const tilt = (el, max) => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    };
    const pp = $('.portrait-panel'), pf = $('#portrait');
    pf.addEventListener('mousemove', e => {
      const r = pf.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      pp.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    pf.addEventListener('mouseleave', () => pp.style.transform = '');
    $$('.m-card').forEach(el => tilt(el, 8));
    spots.forEach(el => el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
  }

  // ---- click ripple on buttons and contact cards ----
  $$('.btn, .c-card').forEach(el => el.addEventListener('click', e => {
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span');
    d.className = 'ripple'; d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.appendChild(d); setTimeout(() => d.remove(), 700);
  }));

  // ---- scroll: nav, progress, parallax, timeline line, marquee speed ----
  const nav = $('.nav'), bar = $('.progress'), links = $$('.nav-links a');
  const secs = links.map(a => $(a.getAttribute('href')));
  const mega = $('.mega'), track = $('.track'), tl = $('.timeline'), tline = $('#tline'), items = $$('.t-item');
  const para = $$('[data-speed]');
  let lastY = scrollY, mx = 0, vel = 0;
  function onScroll() {
    revealVisible();
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 500 && !$('#navLinks').classList.contains('open'));
    vel = Math.min(40, Math.abs(y - lastY)); lastY = y;
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    let idx = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) idx = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === idx));
    const pct = h > 0 ? y / h : 0;
    $('#hudPct').textContent = String(Math.round(pct * 100)).padStart(3, '0') + '%';
    $('#hudBar').style.height = pct * 100 + '%';
    $('#hudSec').textContent = idx < 0 ? '00 · Home' : String(idx + 1).padStart(2, '0') + ' · ' + links[idx].textContent.replace(/^\d+/, '');
    if (reduce) return;
    if (y < innerHeight * 1.2) mega.style.transform = `translateY(${y * .25}px)`;
    para.forEach(el => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translateY(${(r.top - innerHeight / 2) * -(+el.dataset.speed)}px)`; });
    const r = tl.getBoundingClientRect(), mid = innerHeight * .6;
    tline.style.height = Math.max(0, Math.min(r.height, mid - r.top)) + 'px';
    items.forEach(it => it.classList.toggle('lit', it.getBoundingClientRect().top + 44 < mid));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (!reduce) (function marquee() {
    mx -= .6 + vel * .35; vel *= .92;
    const half = track.scrollWidth / 2; if (-mx >= half) mx += half;
    track.style.transform = `translateX(${mx}px) skewX(${-vel * .25}deg)`;
    requestAnimationFrame(marquee);
  })();

  // ---- mobile menu ----
  const burger = $('#burger'), menu = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    body.style.overflow = open ? 'hidden' : '';
  });
  links.forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); body.style.overflow = '';
  }));

  // ---- tech layer: neural nets beside section titles ----
  const NS = 'http://www.w3.org/2000/svg';
  $$('.section:not(.contact)').forEach((sec, k) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'net'); svg.setAttribute('viewBox', '0 0 460 220'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><linearGradient id="netg' + k + '" x1="0" x2="1"><stop offset="0" stop-color="#2ef2d9"/><stop offset="1" stop-color="#3ee08a"/></linearGradient></defs>';
    const cols = [40, 150, 270, 400], nodes = [];
    cols.forEach((x, c) => { const n = c === 0 || c === 3 ? 3 : 4; for (let i = 0; i < n; i++) nodes.push({ x, y: 30 + i * (160 / (n - 1)) + (n === 3 ? 0 : 0), c }); });
    nodes.forEach(a => nodes.forEach(b => {
      if (b.c !== a.c + 1) return;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
      if (Math.random() < .28) { l.setAttribute('class', 'hot'); l.setAttribute('stroke', `url(#netg${k})`); l.style.animationDelay = (-Math.random() * 2) + 's'; }
      svg.appendChild(l);
    }));
    nodes.forEach((n, i) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', n.c === 3 ? 6 : 4.5);
      c.setAttribute('class', ['', 'b', 'g', 'on'][n.c] + (Math.random() < .2 ? ' on' : ''));
      c.style.animationDelay = (-Math.random() * 2.4) + 's';
      svg.appendChild(c);
    });
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', 40); t.setAttribute('y', 214); t.textContent = 'NODE_' + String(k + 1).padStart(2, '0') + ' // INPUT → OUTPUT';
    svg.appendChild(t);
    sec.appendChild(svg);
  });

  // ---- tech layer: timeline ids ----
  items.forEach((it, i) => $('.t-when', it).dataset.id = '[ 0x' + (items.length - i).toString(16).padStart(2, '0').toUpperCase() + ' ]');

  // ---- tech layer: terminal types the profile when it scrolls into view ----
  const term = $('#termCode');
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = [
    ['c', '// emil.json — the short version'],
    ['p', '{'],
    ['kv', 'superpower', '"finding the problem before solving it"'],
    ['kv', 'builds_with_ai', '["apps", "dashboards", "content", "campaigns"]'],
    ['kv', 'thinks_in', '["systems", "data", "people"]'],
    ['kv', 'languages', '["English", "Hindi"]'],
    ['kv', 'based_in', '"Kerala, India"'],
    ['kv', 'open_to', '"opportunities that move a business forward"', true],
    ['p', '}']
  ];
  function render(n) {
    let out = '';
    lines.slice(0, n).forEach((l, i) => {
      let h;
      if (l[0] === 'c') h = `<span class="c">${esc(l[1])}</span>`;
      else if (l[0] === 'p') h = esc(l[1]);
      else {
        const v = esc(l[2]).replace(/"([^"]*)"/g, '<span class="s">"$1"</span>').replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
        h = `  <span class="k">"${l[1]}"</span>: ${v}${l[3] ? '' : ','}`;
      }
      out += h + '\n';
    });
    return out;
  }
  let typedOnce = false;
  function typeTerm() {
    if (typedOnce) return; typedOnce = true;
    if (reduce) { term.innerHTML = render(lines.length); return; }
    let n = 0;
    (function next() { n++; term.innerHTML = render(n) + '<span class="cur"></span>'; if (n < lines.length) setTimeout(next, 160); })();
  }
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { typeTerm(); o.disconnect(); } }), { threshold: .3 }).observe($('.term'));

  // ---- blockchain band: linked blocks that verify one after another ----
  const chain = $('#chain'), chainStat = $('#chainStat');
  const hex = n => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const LABELS = ['Find', 'Frame', 'Data', 'AI', 'Build', 'Measure', 'Grow', 'Trust'];
  let prev = '0x' + '0'.repeat(10);
  LABELS.forEach((l, i) => {
    const h = '0x' + hex(10);
    if (i) { const k = document.createElement('i'); k.className = 'lnk'; k.style.setProperty('animation-delay', -i * .2 + 's'); chain.appendChild(k); }
    const b = document.createElement('div'); b.className = 'blk';
    b.innerHTML = `<span class="id">BLOCK #${String(i + 1).padStart(3, '0')}</span><h5>${l}</h5><span class="h">hash ${h}</span><span class="h">prev ${prev}</span><div class="st">○ pending</div>`;
    chain.appendChild(b); prev = h;
  });
  const blks = $$('.blk', chain);
  let bi = 0;
  function mine() {
    blks.forEach((b, i) => {
      b.classList.toggle('mining', i === bi);
      b.classList.toggle('ok', i < bi);
      $('.st', b).textContent = i < bi ? '✓ verified' : i === bi ? '◌ mining…' : '○ pending';
    });
    const cur = blks[Math.min(bi, blks.length - 1)];
    chain.scrollTo({ left: Math.max(0, cur.offsetLeft - chain.clientWidth / 2 + cur.offsetWidth / 2), behavior: reduce ? 'auto' : 'smooth' });
    chainStat.textContent = bi < blks.length ? `block ${bi + 1}/${blks.length} · validating` : 'chain verified ✓';
    bi = bi >= blks.length ? 0 : bi + 1;
    setTimeout(mine, bi === 0 ? 2600 : 900);
  }
  if (reduce) { bi = blks.length; } mine();

  // ---- network globe behind contact ----
  const gc = $('#globe'), gx = gc.getContext('2d');
  const GP = [], N = 420;
  for (let i = 0; i < N; i++) {           // fibonacci sphere
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    GP.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  const ARCS = Array.from({ length: 16 }, () => [Math.floor(Math.random() * N), Math.floor(Math.random() * N), Math.random()]);
  let rot = 0, gS = 0;
  function gsize() { const d = Math.min(devicePixelRatio || 1, 2); gS = gc.clientWidth; gc.width = gS * d; gc.height = gS * d; gx.setTransform(d, 0, 0, d, 0, 0); }
  gsize(); addEventListener('resize', gsize);
  function proj(p) {
    const c = Math.cos(rot), s2 = Math.sin(rot), x = p[0] * c - p[2] * s2, z = p[0] * s2 + p[2] * c, t = .35, y = p[1] * Math.cos(t) - z * Math.sin(t), z2 = p[1] * Math.sin(t) + z * Math.cos(t);
    const R = gS * .38; return [gS / 2 + x * R, gS / 2 + y * R, z2];
  }
  let gVisible = true;
  new IntersectionObserver(es => { gVisible = es[0].isIntersecting; }).observe(gc);
  function globe() {
    if (gVisible || reduce) {
      gx.clearRect(0, 0, gS, gS);
      const pr = GP.map(proj);
      pr.forEach(([x, y, z]) => {
        const a = z > 0 ? .25 + .6 * z : .07;
        gx.fillStyle = z > 0 ? `rgba(46,242,217,${a})` : `rgba(59,155,255,${a})`;
        gx.fillRect(x - 1, y - 1, z > 0 ? 2.2 : 1.4, z > 0 ? 2.2 : 1.4);
      });
      ARCS.forEach(arc => {
        const A = pr[arc[0]], B = pr[arc[1]];
        if (A[2] < 0 || B[2] < 0) return;
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = mx - gS / 2, dy = my - gS / 2, L = Math.hypot(dx, dy) || 1, lift = gS * .12;
        const cx = mx + dx / L * lift, cy = my + dy / L * lift;
        gx.strokeStyle = 'rgba(62,224,138,.35)'; gx.lineWidth = 1;
        gx.beginPath(); gx.moveTo(A[0], A[1]); gx.quadraticCurveTo(cx, cy, B[0], B[1]); gx.stroke();
        arc[2] = (arc[2] + .008) % 1; const t = arc[2], u = 1 - t;
        const px = u * u * A[0] + 2 * u * t * cx + t * t * B[0], py = u * u * A[1] + 2 * u * t * cy + t * t * B[1];
        gx.fillStyle = '#3ee08a'; gx.beginPath(); gx.arc(px, py, 2.4, 0, 7); gx.fill();
      });
      rot += .0025;
    }
    if (!reduce) requestAnimationFrame(globe);
  }
  globe();

  // ---- hero live log: the find → build → measure loop, on repeat ----
  const logEl = $('#log');
  const LOG = [
    ['go', '› scanning workflow for friction…'],
    ['warn', '! bottleneck found: manual, repeated task'],
    ['go', '› framing the problem with leadership…'],
    ['go', '› choosing the fix: AI · process · hire · campaign'],
    ['go', '› building & deploying solution…'],
    ['ok', '✓ solution live — measuring impact'],
    ['ok', '✓ insight delivered to decision-maker'],
    ['go', '› next problem →']
  ];
  let li = 0;
  function logTick() {
    const [cls, msg] = LOG[li % LOG.length], t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
    const p = document.createElement('p'); p.innerHTML = `<span class="t">${t}</span><span class="${cls}">${msg}</span>`;
    logEl.appendChild(p); while (logEl.children.length > 5) logEl.firstChild.remove();
    li++; setTimeout(logTick, li % LOG.length === 0 ? 2400 : 1300);
  }
  if (reduce) LOG.slice(0, 5).forEach(([c, m]) => { const p = document.createElement('p'); p.innerHTML = `<span class="${c}">${m}</span>`; logEl.appendChild(p); });
  else setTimeout(logTick, 1500);

  // ---- IST clock + year ----
  const clock = $('#clock');
  function tick() {
    clock.textContent = 'IST ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);
  $('#yr').textContent = new Date().getFullYear();
})();
