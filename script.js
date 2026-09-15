/* ════════════════════════════════════════════════
   Río Deva — Rancagua
   SPA por pestañas + reveal + menú móvil.
   ════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Pantalla de carga: se va rápido, y pase lo que pase se va ── */
  var loader = document.getElementById('loader');
  function cerrarLoader() { if (loader) loader.classList.add('off'); }
  window.addEventListener('load', function () { setTimeout(cerrarLoader, 380); });
  // red de seguridad: si 'load' no dispara (imagen colgada), igual se cierra
  setTimeout(cerrarLoader, 1400);

  /* ── 2. Pestañas ── */
  var links  = document.querySelectorAll('[data-tab]');
  var burger = document.getElementById('burger');
  var nav    = document.getElementById('nav');

  function goToTab(id) {
    // Se consultan en vivo, no capturados al cargar: así un panel
    // inyectado después por un módulo universal también se apaga bien.
    document.querySelectorAll('[data-tab-panel]').forEach(function (p) {
      p.classList.toggle('on', p.getAttribute('data-tab-panel') === id);
    });
    document.querySelectorAll('.nav-links [data-tab]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-tab') === id);
    });

    cerrarMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    revelar();                                  // relanza las animaciones
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  window.goToTab = goToTab;

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goToTab(a.getAttribute('data-tab'));
    });
  });

  /* ── 3. Menú hamburguesa ── */
  function cerrarMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var abierto = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarMenu();
  });

  /* ── 4. Scroll reveal, con red de seguridad ── */
  var io = null;
  function revelar() {
    var items = document.querySelectorAll('.reveal:not(.seen)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('seen'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    items.forEach(function (el) { io.observe(el); });
  }
  revelar();

  // Red de seguridad: si algo no disparó en 2,2 s, se muestra igual.
  // Vale más un reveal que no se ve que una sección invisible.
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.seen)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) el.classList.add('seen');
    });
  }, 2200);

  /* ── 5. Marquesina: se duplica el contenido para que el bucle cierre ── */
  var strip = document.querySelector('.strip-in');
  if (strip) strip.innerHTML += strip.innerHTML;

  /* ── 6. Día de hoy marcado en el horario (fallback si horario.js no corre) ── */
  var hoy = new Date().getDay();               // 0 = domingo
  document.querySelectorAll('#horario-lista li').forEach(function (li) {
    if (parseInt(li.getAttribute('data-dia'), 10) === hoy) li.classList.add('hoy');
  });

  /* ── 7. Botón volver arriba ── */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 520);
    }, { passive: true });
  }

  /* ── 8. Abrir en la pestaña del hash, si viene una válida ── */
  var hash = (location.hash || '').replace('#', '');
  if (hash && document.querySelector('[data-tab-panel="' + hash + '"]')) goToTab(hash);
})();
