/**
 * @name        AeroCordFX
 * @author      AeroCord
 * @description Liquid bubble & ripple click effects for the AeroCord theme
 * @version     2.0.0
 * @source      AeroCordFX.plugin.js
 *
 * INSTALL: Drop this file into your BetterDiscord plugins folder.
 *          Enable it in Settings → Plugins.
 *
 * Works standalone OR paired with AeroCord.theme.css for the full experience.
 */

module.exports = class AeroCordFX {

  constructor() {
    this._handleClick  = this._handleClick.bind(this);
    this._handleDown   = this._handleDown.bind(this);
    this._styleEl      = null;
    this._bubbleCanvas = null;
    this._bgBubbles    = [];
    this._rafId        = null;
  }

  getName()        { return 'AeroCordFX'; }
  getDescription() { return 'Frutiger Aero liquid click FX + floating background bubbles'; }
  getVersion()     { return '2.0.0'; }
  getAuthor()      { return 'AeroCord'; }

  /* ── Lifecycle ── */
  start() {
    this._injectStyles();
    this._injectBubbleCanvas();
    document.addEventListener('click',     this._handleClick,  true);
    document.addEventListener('mousedown', this._handleDown,   true);
  }

  stop() {
    document.removeEventListener('click',     this._handleClick,  true);
    document.removeEventListener('mousedown', this._handleDown,   true);
    this._styleEl?.remove();
    this._bubbleCanvas?.remove();
    if (this._rafId) cancelAnimationFrame(this._rafId);
    document.getElementById('aerocord-fx-layer')?.remove();
  }

  /* ── CSS keyframes ── */
  _injectStyles() {
    this._styleEl = document.createElement('style');
    this._styleEl.id = 'aerocord-fx-styles';
    this._styleEl.textContent = `
      #aerocord-fx-layer {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999;
        overflow: hidden;
      }
      .aero-ripple {
        position: absolute; border-radius: 50%; pointer-events: none;
        transform: translate(-50%,-50%) scale(0);
        animation: aeroRipple .65s cubic-bezier(.2,.65,.3,1) forwards;
      }
      .aero-ring {
        position: absolute; border-radius: 50%; pointer-events: none;
        transform: translate(-50%,-50%) scale(0); background: transparent;
        animation: aeroRipple .92s cubic-bezier(.15,.6,.25,1) forwards;
      }
      .aero-bpop {
        position: absolute; border-radius: 50%; pointer-events: none;
        transform: translate(-50%,-50%) scale(0);
        animation: aeroBpop .52s cubic-bezier(.22,.6,.35,.96) forwards;
      }
      .aero-blob {
        position: absolute; pointer-events: none;
        transform: translate(-50%,-50%) scale(0);
        animation: aeroBlob .58s cubic-bezier(.2,.65,.3,1) forwards;
      }
      @keyframes aeroRipple {
        0%   { transform: translate(-50%,-50%) scale(0);   opacity: .9; }
        100% { transform: translate(-50%,-50%) scale(1);   opacity: 0;  }
      }
      @keyframes aeroBpop {
        0%   { transform: translate(-50%,-50%) scale(0);   opacity: .85; }
        55%  { opacity: .55; }
        100% { transform: translate(-50%,-50%) scale(1.9); opacity: 0;   }
      }
      @keyframes aeroBlob {
        0%   { transform: translate(-50%,-50%) scale(0)   rotate(0deg);   opacity: .7; }
        100% { transform: translate(-50%,-50%) scale(1.6) rotate(40deg);  opacity: 0;  }
      }
    `;
    document.head.appendChild(this._styleEl);

    // FX layer
    if (!document.getElementById('aerocord-fx-layer')) {
      const layer = document.createElement('div');
      layer.id = 'aerocord-fx-layer';
      document.body.appendChild(layer);
    }
  }

  /* ── Click handler — liquid burst ── */
  _handleClick(e) {
    const x = e.clientX, y = e.clientY;
    this._spawnRipple(x, y);
    this._spawnMicroBubbles(x, y, 7);
    // Outer ring (delayed)
    setTimeout(() => this._spawnRing(x, y), 75);
  }

  _handleDown(e) {
    if (e.button !== 0) return;
    setTimeout(() => this._spawnBlobBurst(e.clientX, e.clientY), 55);
  }

  _spawnRipple(x, y) {
    const sz = 68 + Math.random() * 64;
    const hue = 188 + Math.random() * 20;
    this._el('aero-ripple', x, y, `
      width:${sz}px; height:${sz}px;
      background: radial-gradient(circle,
        hsla(${hue},88%,70%,.52) 0%,
        hsla(${hue},80%,60%,.2) 45%,
        transparent 72%);
      border: 1.5px solid hsla(${hue},92%,82%,.62);
      box-shadow: 0 0 22px hsla(${hue},85%,65%,.28),
                  inset 0 0 12px rgba(255,255,255,.12);
    `, 700);
  }

  _spawnRing(x, y) {
    const sz = 115 + Math.random() * 55;
    this._el('aero-ring', x, y, `
      width:${sz}px; height:${sz}px;
      border: 1px solid rgba(93,220,247,.28);
    `, 960);
  }

  _spawnMicroBubbles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - .5) * .9;
      const dist  = 16 + Math.random() * 54;
      const bx    = x + Math.cos(angle) * dist;
      const by    = y + Math.sin(angle) * dist;
      const bs    = 5 + Math.random() * 24;
      const hue   = 182 + Math.random() * 55;
      const delay = i * 42 + Math.random() * 28;
      setTimeout(() => {
        this._el('aero-bpop', bx, by, `
          width:${bs}px; height:${bs}px;
          background: radial-gradient(circle at 34% 31%,
            rgba(255,255,255,.72) 0%,
            hsla(${hue},92%,82%,.48) 30%,
            hsla(${hue},80%,62%,.18) 68%,
            transparent 100%);
          border: 1px solid rgba(255,255,255,.46);
        `, 580);
      }, delay);
    }
  }

  _spawnBlobBurst(x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 8 + i * 13 + Math.random() * 14;
      const bx    = x + Math.cos(angle) * dist;
      const by    = y + Math.sin(angle) * dist;
      const bs    = 13 + i * 8 + Math.random() * 9;
      const hue   = 185 + Math.random() * 50;
      const br    = 28 + Math.random() * 44;
      setTimeout(() => {
        this._el('aero-blob', bx, by, `
          width:${bs}px; height:${bs}px;
          border-radius: ${br}%;
          background: radial-gradient(circle,
            rgba(160,245,255,.38) 0%,
            rgba(80,200,240,.14) 60%,
            transparent 100%);
          border: 1px solid rgba(180,240,255,.4);
        `, 640);
      }, i * 28);
    }
  }

  _el(cls, x, y, style, dur) {
    const layer = document.getElementById('aerocord-fx-layer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = cls;
    el.style.cssText = `left:${x}px; top:${y}px; ${style}`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), dur + 60);
  }

  /* ── Background bubble canvas ── */
  _injectBubbleCanvas() {
    const existing = document.getElementById('aerocord-bg-canvas');
    if (existing) existing.remove();

    const cv = document.createElement('canvas');
    cv.id = 'aerocord-bg-canvas';
    Object.assign(cv.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '0',
    });
    document.body.insertBefore(cv, document.body.firstChild);
    this._bubbleCanvas = cv;

    const ctx = cv.getContext('2d');
    let W = 0, H = 0;

    const resize = () => {
      W = cv.width  = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Background orbs ── */
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: .16 + Math.random() * .26,
      vx: (Math.random() - .5) * .00010,
      vy: (Math.random() - .5) * .00010,
      hue: [196,172,155,210,168,184][i],
      al: .06 + Math.random() * .06,
      ph: Math.random() * Math.PI * 2,
    }));

    /* ── Floating bubbles ── */
    const bubs = [];
    const newBub = (init) => ({
      x: Math.random() * 2400,
      y: init ? Math.random() * 1000 : 1000 + 40,
      r: 6 + Math.random() * 40,
      vx: (Math.random() - .5) * .36,
      vy: -(0.22 + Math.random() * .5),
      al: .45 + Math.random() * .35,
      dr: (Math.random() - .5) * .007,
      hue: 183 + Math.random() * 44,
      born: performance.now() - (init ? Math.random() * 14000 : 0),
      life: 10000 + Math.random() * 11000,
    });
    for (let i = 0; i < 26; i++) bubs.push(newBub(true));

    /* ── Light rays ── */
    const rays = Array.from({ length: 9 }, () => ({
      ang: -58 + Math.random() * 120,
      ph:  Math.random() * Math.PI * 2,
      sp:  .0004 + Math.random() * .0006,
      al:  .022 + Math.random() * .042,
      w:   32 + Math.random() * 52,
    }));

    /* ── Wii U shapes ── */
    const shapes = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * 1600, y: Math.random() * 900,
      vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15,
      sz: 9 + Math.random() * 19, rot: Math.random() * Math.PI * 2,
      rv: (Math.random() - .5) * .004,
      sh: i % 4, hue: 163 + Math.random() * 52,
      al: .03 + Math.random() * .05,
      ph: Math.random() * Math.PI * 2,
    }));

    const draw = (ts) => {
      this._rafId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      // Sky gradient
      const sk = ctx.createLinearGradient(0, 0, W * .35, H);
      sk.addColorStop(0,   '#041228');
      sk.addColorStop(.38, '#073a6e');
      sk.addColorStop(.72, '#0e6aac');
      sk.addColorStop(1,   '#1480c8');
      ctx.fillStyle = sk;
      ctx.fillRect(0, 0, W, H);

      // Orbs
      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy; o.ph += .0018;
        if (o.x < -.3) o.x = 1.3; if (o.x > 1.3) o.x = -.3;
        if (o.y < -.3) o.y = 1.3; if (o.y > 1.3) o.y = -.3;
        const px = o.x * W, py = o.y * H, pr = o.r * Math.min(W, H);
        const a = o.al * (.78 + .22 * Math.sin(o.ph));
        const og = ctx.createRadialGradient(px, py, 0, px, py, pr);
        og.addColorStop(0,   `hsla(${o.hue},70%,65%,${a})`);
        og.addColorStop(.55, `hsla(${o.hue},65%,50%,${a * .45})`);
        og.addColorStop(1,   `hsla(${o.hue},60%,38%,0)`);
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * .72, o.ph * .28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rays
      for (const r of rays) {
        r.ph += r.sp;
        const a = r.al * (.55 + .45 * Math.sin(r.ph));
        ctx.save();
        ctx.translate(W * .12, -40);
        ctx.rotate(r.ang * Math.PI / 180);
        const rg = ctx.createLinearGradient(0, 0, 0, H * 1.4);
        rg.addColorStop(0,   `rgba(110,215,255,${a})`);
        rg.addColorStop(.5,  `rgba(70,170,215,${a * .42})`);
        rg.addColorStop(1,   'rgba(40,130,175,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(-r.w / 2, 0, r.w, H * 1.55);
        ctx.restore();
      }

      // Wii U shapes
      for (const s of shapes) {
        s.x += s.vx; s.y += s.vy; s.rot += s.rv; s.ph += .007;
        if (s.x < -60) s.x = W + 60; if (s.x > W + 60) s.x = -60;
        if (s.y < -60) s.y = H + 60; if (s.y > H + 60) s.y = -60;
        const a = s.al * (.65 + .35 * Math.sin(s.ph));
        const d = s.sz;
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
        ctx.strokeStyle = `hsla(${s.hue},88%,76%,${a})`;
        ctx.lineWidth = 1.3;
        ctx.fillStyle = `hsla(${s.hue},80%,65%,${a * .26})`;
        ctx.beginPath();
        if (s.sh === 0) {
          ctx.arc(0, 0, d, 0, Math.PI * 2);
        } else if (s.sh === 1) {
          const rd = d * .38;
          ctx.moveTo(-d + rd, -d); ctx.arcTo(d, -d, d, -d + rd, rd);
          ctx.arcTo(d, d, d - rd, d, rd); ctx.arcTo(-d, d, -d, d - rd, rd);
          ctx.arcTo(-d, -d, -d + rd, -d, rd); ctx.closePath();
        } else if (s.sh === 2) {
          ctx.moveTo(0, -d); ctx.lineTo(d, 0); ctx.lineTo(0, d);
          ctx.lineTo(-d, 0); ctx.closePath();
        } else {
          for (let p = 0; p < 5; p++) {
            const a1 = (p * 4 * Math.PI / 5) - Math.PI / 2;
            const a2 = ((p * 4 + 2) * Math.PI / 5) - Math.PI / 2;
            p === 0
              ? ctx.moveTo(Math.cos(a1) * d, Math.sin(a1) * d)
              : ctx.lineTo(Math.cos(a1) * d, Math.sin(a1) * d);
            ctx.lineTo(Math.cos(a2) * d * .42, Math.sin(a2) * d * .42);
          }
          ctx.closePath();
        }
        ctx.fill(); ctx.stroke(); ctx.restore();
      }

      // Floating bubbles
      const now = performance.now();
      for (let i = bubs.length - 1; i >= 0; i--) {
        const b = bubs[i];
        const age = (now - b.born) / b.life;
        if (age > 1) { bubs.splice(i, 1); bubs.push(newBub(false)); continue; }
        b.x += b.vx + Math.sin(now * .00074 + i * 1.3) * b.dr * W;
        b.y += b.vy;
        const fade = age < .1 ? age / .1 : age > .82 ? (1 - age) / .18 : 1;
        const r = b.r;
        ctx.save();
        const bg = ctx.createRadialGradient(b.x, b.y, r * .05, b.x, b.y, r);
        bg.addColorStop(0,   `hsla(${b.hue},88%,88%,${b.al * .16 * fade})`);
        bg.addColorStop(.55, `hsla(${b.hue},82%,72%,${b.al * .09 * fade})`);
        bg.addColorStop(1,   `hsla(${b.hue},76%,60%,${b.al * .23 * fade})`);
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `hsla(${b.hue},92%,90%,${b.al * .44 * fade})`;
        ctx.lineWidth = .85; ctx.stroke();
        // Main gloss
        ctx.fillStyle = `rgba(255,255,255,${.5 * fade})`;
        ctx.beginPath();
        ctx.ellipse(b.x - r * .26, b.y - r * .26, r * .3, r * .2, -.38, 0, Math.PI * 2);
        ctx.fill();
        // Secondary gloss
        ctx.fillStyle = `rgba(255,255,255,${.18 * fade})`;
        ctx.beginPath();
        ctx.ellipse(b.x + r * .14, b.y + r * .28, r * .11, r * .07, .28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Horizon glow
      const hg = ctx.createLinearGradient(0, H * .58, 0, H);
      hg.addColorStop(0,   'rgba(14,120,192,0)');
      hg.addColorStop(.55, 'rgba(8,72,132,.07)');
      hg.addColorStop(1,   'rgba(4,32,72,.15)');
      ctx.fillStyle = hg; ctx.fillRect(0, H * .58, W, H * .42);
    };

    requestAnimationFrame(draw);
  }
};
