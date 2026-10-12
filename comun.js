// Compartido por todas las páginas: estado «Abierto · cierra a las…» calculado desde data/negocio.json.
// Expone window.RYORI_NEGOCIO (promesa con los datos del local) para que otras páginas los usen.
(() => {
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const aMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  const hora = h => (h === '24:00' ? 'medianoche' : `las ${h}`);

  // Día y minuto actuales en la hora de Chile, sin importar dónde esté el teléfono.
  function ahoraEn(zona) {
    const partes = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: zona, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
    return { dia, minuto: Number(partes.hour) * 60 + Number(partes.minute) };
  }

  function estado(horario, zona) {
    const { dia, minuto } = ahoraEn(zona);
    const tramos = d => horario.dias[String((d + 7) % 7)] || [];
    for (const [abre, cierra] of tramos(dia)) {
      if (minuto >= aMin(abre) && minuto < aMin(cierra)) return { abierto: true, texto: `Abierto · cierra a ${hora(cierra)}` };
    }
    const luego = tramos(dia).find(([abre]) => aMin(abre) > minuto);
    if (luego) return { abierto: false, texto: `Cerrado · abre hoy a ${hora(luego[0])}` };
    for (let i = 1; i <= 7; i++) {
      const t = tramos(dia + i)[0];
      if (t) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? 'mañana' : `el ${DIAS[(dia + i) % 7]}`} a ${hora(t[0])}` };
    }
    return null;
  }

  const raiz = document.documentElement.dataset.raiz || '/';
  window.RYORI_NEGOCIO = fetch(`${raiz}data/negocio.json`).then(r => r.json());
  window.RYORI_NEGOCIO.then(n => {
    const pintar = () => {
      const e = estado(n.horario, n.zonaHoraria);
      if (!e) return;
      document.querySelectorAll('[data-estado]').forEach(el => {
        el.textContent = e.texto;
        el.dataset.abierto = e.abierto ? 'si' : 'no';
      });
    };
    pintar();
    setInterval(pintar, 60000);
  }).catch(() => { /* sin datos no se muestra el estado; el resto de la página funciona igual */ });
})();
