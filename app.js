/* Antesis — interacciones del sitio */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Navbar: fondo al hacer scroll + menú móvil */
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuBtn) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
  }

  /* Tema claro / oscuro */
  const themeBtn = $('#themeBtn');
  const themeMeta = $('meta[name="theme-color"]');
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#fbfaff' : '#08070c');
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  };
  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }
  // Si la persona no eligió tema, sigue el del sistema
  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'light' : 'dark');
    });
  }

  /* Animaciones de entrada */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* Enlace activo según la sección visible */
  const links = $$('.nav-links a[href^="#"], .toc a[href^="#"]');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* Spotlight que sigue al cursor en las tarjetas */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* Filtro de proyectos */
  const filters = $$('.filter');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      $$('.project').forEach((card) => {
        const show = f === 'all' || (card.dataset.category || '').split(' ').includes(f);
        card.classList.toggle('is-hidden', !show);
        if (show) card.classList.add('in');
      });
    });
  });

  /* Toast */
  const toast = $('#toast');
  let toastTimer;
  const notify = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  /* Copiar correo */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        notify('Correo copiado al portapapeles');
      } catch {
        window.location.href = 'mailto:' + btn.dataset.copy;
      }
    });
  });

  /* Formulario → abre el cliente de correo con el mensaje armado */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const mensaje = form.mensaje.value.trim();
      if (!nombre || !mensaje) {
        notify('Completa tu nombre y el mensaje');
        (nombre ? form.mensaje : form.nombre).focus();
        return;
      }
      const tipo = form.tipo.value;
      const subject = `${tipo} — ${nombre}`;
      const body = `Hola Fernanda,\n\n${mensaje}\n\n— ${nombre}`;
      window.location.href = `mailto:mendiolasilvafernanda@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* Año actual */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
