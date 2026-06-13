/* ============================================
   LUMÉN — Constellation
   An interactive field of gold particles that
   link into faint constellation lines, drifting
   slowly and gathering toward the cursor —
   echoing the brand's signature: jewelry that
   wears like captured light.
   ============================================ */

(function () {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, active: false };
  let w, h, dpr;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    init();
  }

  function init() {
    const density = Math.max(40, Math.min(110, Math.floor((w * h) / 14000)));
    particles = [];
    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.4,
        tw: Math.random() * Math.PI * 2 // twinkle phase
      });
    }
  }

  function step(t) {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // gentle drift
      p.x += p.vx;
      p.y += p.vy;

      // wrap edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // attraction toward cursor
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 220;
        if (dist < radius) {
          const force = (1 - dist / radius) * 0.025;
          p.x += dx * force;
          p.y += dy * force;
        }
      }

      // twinkle
      const tw = 0.55 + Math.sin(t * 0.001 + p.tw) * 0.45;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(205, 168, 107, ${0.25 + tw * 0.55})`;
      ctx.fill();
    }

    // constellation lines — connect nearby particles
    const linkDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(246, 242, 234, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // glow lines toward cursor
    if (mouse.active) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(205, 168, 107, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('pointerleave', () => {
    mouse.active = false;
  });

  resize();
  if (reduceMotion) {
    step(0); // draw a single static frame
  } else {
    requestAnimationFrame(step);
  }
})();


/* ============================================
   Header shrink / blend on scroll (subtle)
   ============================================ */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.padding = '18px 0';
    } else {
      header.style.padding = '28px 0';
    }
  });
})();


/* ============================================
   Product card mini canvases — small constellation
   that flickers on hover, echoing the hero
   ============================================ */
(function () {
  const cards = document.querySelectorAll('.product-visual canvas.mini-field');
  cards.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, dots = [];
    let raf = null;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      dots = [];
      for (let i = 0; i < 22; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        const tw = 0.4 + Math.sin(t * 0.002 + d.tw) * 0.6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 168, 107, ${0.2 + tw * 0.5})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(246,242,234,${(1 - dist / 60) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    const parent = canvas.closest('.product-visual');
    parent.addEventListener('pointerenter', () => {
      size();
      if (!raf) raf = requestAnimationFrame(draw);
    });
    parent.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      ctx.clearRect(0, 0, w, h);
    });

    size();
  });
})();
