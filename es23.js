/* Vicio boards: Spanish for the Nov 21 to 23 additions (Eric, Nov 23 2026). Loaded last by config.js; both boards.
   The boards already switch to Spanish with the ES button; this adds the wording for the newer pieces: the bar count
   (slide the level, backups, submit and lock, checks, batches), the soda and CO2 section (order day, order list,
   expirations), the attic pull-downs, count by voice, the bottle profile labels and the kitchen Prepped / Whole product
   tabs. It runs after the other add-ons have drawn, and only touches text it knows. Bottle descriptions and pitches stay
   in English for now. Voice counting listens and speaks in Spanish when the board is in Spanish (voicecount.js). */
(function () {
  if (window.__vicioEs23 || (window.VICIO_BOARD !== 'foh' && window.VICIO_BOARD !== 'kitchen')) return;
  window.__vicioEs23 = true;
  var D = {
    'Slide the level': 'Desliza el nivel', '\u00b7 double-tap to clear': '\u00b7 doble toque para borrar', 'Full backups': 'Botellas llenas', 'None left': 'No queda', 'Par': 'Par',
    'Tip: slide your finger up or down the bottle, or use the slider under it. Double-tap a bottle to clear its entry.': 'Tip: desliza el dedo hacia arriba o abajo en la botella, o usa la barra de abajo. Doble toque en una botella borra su conteo.',
    'Submit bar count': 'Enviar conteo del bar', 'Bar count submitted': 'Conteo del bar enviado', 'Reopen the count': 'Reabrir el conteo', 'A manager can reopen it.': 'Un gerente puede reabrirlo.', 'Every line is counted.': 'Todo est\u00e1 contado.',
    'Type your first name, then submit.': 'Escribe tu nombre y luego env\u00eda.', 'Submitted': 'Enviado', 'Copy order': 'Copiar pedido', 'Order list': 'Lista de pedido', 'Next Swire order': 'Pr\u00f3ximo pedido a Swire',
    'Expires': 'Caduca', 'Expired': 'Caducado', 'Expires today': 'Caduca hoy', 'On the order': 'En el pedido', 'Settings': 'Ajustes', 'Order day': 'D\u00eda de pedido', 'Reorder at': 'Pedir cuando quede', 'CO2 spare tanks to keep': 'Tanques de CO2 de repuesto',
    'Cases': 'Cajas', 'Sleeves': 'Mangas', 'Boxes': 'Cajitas', 'Rolls': 'Rollos', 'Packs': 'Paquetes', 'Bottles': 'Botellas', 'Bundles': 'Bultos', 'Pieces': 'Piezas', 'Cases + loose': 'Cajas + sueltos',
    'Make more': 'Hacer m\u00e1s', 'Batches to make': 'Lotes por hacer', 'Delivery came': 'Lleg\u00f3 entrega', 'Count is right': 'El conteo est\u00e1 bien', 'Spec': 'Receta', 'No batch recipe written yet': 'A\u00fan no hay receta del lote',
    'Make': 'Hacer', 'Order': 'Pedir', 'Level or count': 'Nivel o conteo', 'No spare CO2 tank. Call Dye Carbonic today.': 'No hay tanque de CO2 de repuesto. Llama a Dye Carbonic hoy.',
    'Tap the level of each bag-in-box, and count the full spare CO2 tanks. Sodas are ordered from Swire.': 'Toca el nivel de cada caja de soda y cuenta los tanques de CO2 llenos de repuesto. Las sodas se piden a Swire.',
    'Tap the mic to talk': 'Toca el micr\u00f3fono para hablar', 'Listening\u2026': 'Escuchando\u2026', 'Now': 'Ahora', 'Last week': 'Semana pasada', 'Back': 'Atr\u00e1s', 'Repeat': 'Repetir', 'Skip': 'Saltar', 'Save': 'Guardar', 'Full': 'Lleno', 'Half': 'Mitad',
    'Didn\u2019t catch a number. Say it again.': 'No escuch\u00e9 un n\u00famero. Dilo otra vez.', 'Didn\u2019t catch that. Say it again.': 'No entend\u00ed. Dilo otra vez.',
    'Say': 'Di', 'Who it\u2019s for': 'Para qui\u00e9n', 'Pair with': 'Acompa\u00f1a con', 'Upsell': 'Venta sugerida', 'Drinks it goes in': 'Bebidas que lo llevan', 'Neat, on the rocks, or mixed with soda.': 'Solo, en las rocas o con soda.',
    'Prepped': 'Preparado', 'Whole product': 'Producto entero', 'Bar count': 'Conteo del bar', 'Beer cooler': 'Refri de cerveza', 'Attic': '\u00c1tico', 'Soda and CO2': 'Sodas y CO2', 'Prep count': 'Conteo de prep'
  };
  var DAYS = { Sunday: 'domingo', Monday: 'lunes', Tuesday: 'martes', Wednesday: 'mi\u00e9rcoles', Thursday: 'jueves', Friday: 'viernes', Saturday: 's\u00e1bado' };
  var MON = { Jan: 'ene', Feb: 'feb', Mar: 'mar', Apr: 'abr', May: 'may', Jun: 'jun', Jul: 'jul', Aug: 'ago', Sep: 'sep', Oct: 'oct', Nov: 'nov', Dec: 'dic' };
  var R = [
    [/^(\S+ )?Count by voice$/, function (m) { return (m[1] || '') + 'Contar por voz'; }],
    [/^(\d+) of (\d+) counted$/, '$1 de $2 contados'], [/^Still missing: (.+)\.$/, 'Faltan: $1.'], [/^Email order to Edson( \(\d+\))?$/, 'Enviar pedido a Edson$1'],
    [/^Recheck (\d+)$/, 'Revisar $1'], [/^Up from (.+)$/, 'Subi\u00f3 de $1'], [/^Down from (.+)$/, 'Baj\u00f3 de $1'], [/^Expires in (\d+) days?$/, 'Caduca en $1 d\u00edas'],
    [/^Expired: (.+)\. Swap these boxes out\.$/, 'Caducado: $1. Cambia estas cajas.'], [/^Nothing to order yet\..*$/, 'Nada que pedir todav\u00eda.'],
    [/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\w{3}) (\d+) \((today|tomorrow|in (\d+) days)\)$/, function (m) { return DAYS[m[1]] + ' ' + m[3] + ' ' + (MON[m[2]] || m[2]) + ' (' + (m[4] === 'today' ? 'hoy' : m[4] === 'tomorrow' ? 'ma\u00f1ana' : 'en ' + m[5] + ' d\u00edas') + ')'; }],
    [/^Heard: (.+)$/, 'Escuch\u00e9: $1'], [/^(.+) \u00b7 (\d+) of (\d+)$/, function (m) { return (D[m[1]] || m[1]) + ' \u00b7 ' + m[2] + ' de ' + m[3]; }],
    [/^Say a count like .*$/, 'Di el conteo, como \u201cuno punto cinco\u201d o \u201cdos y medio\u201d, o \u201csaltar\u201d, \u201catr\u00e1s\u201d, \u201cigual\u201d, \u201cnada\u201d, \u201cpara\u201d.'],
    [/^Say \u201ctwo cases and three (.+?)\u201d.*$/, 'Di \u201cdos cajas y tres $1\u201d, \u201cuna caja\u201d o \u201cnada\u201d. O \u201csaltar\u201d, \u201catr\u00e1s\u201d, \u201cpara\u201d.'],
    [/^Say \u201cfull\u201d.*$/, 'Di \u201clleno\u201d, \u201ctres cuartos\u201d, \u201cmitad\u201d, \u201cun cuarto\u201d o \u201cpedir\u201d. O \u201csaltar\u201d, \u201catr\u00e1s\u201d, \u201cpara\u201d.'],
    [/^Say the number\..*$/, 'Di el n\u00famero. O \u201csaltar\u201d, \u201catr\u00e1s\u201d, \u201cnada\u201d, \u201cpara\u201d.']
  ];
  var PH = { 'Your first name': 'Tu nombre', 'Type a count': 'Escribe un conteo', 'Cases': 'Cajas' };
  function tr(v) {
    var k = v.trim(); if (!k) return v;
    if (D[k] != null) return v.replace(k, D[k]);
    for (var i = 0; i < R.length; i++) { var m = k.match(R[i][0]); if (m) return v.replace(k, typeof R[i][1] === 'function' ? R[i][1](m) : k.replace(R[i][0], R[i][1])); }
    return v;
  }
  function walk(root) {
    if (!root || !document.createTreeWalker) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) { var v = n.nodeValue; if (!v || !v.trim()) return; var t = tr(v); if (t !== v) n.nodeValue = t; });
    Array.prototype.forEach.call(root.querySelectorAll('[placeholder]'), function (el) { if (PH[el.placeholder]) el.placeholder = PH[el.placeholder]; });
  }
  function run() { try { if (ui.lang !== 'es') return; } catch (e) { return; } walk(document.getElementById('view')); walk(document.getElementById('x-voice')); walk(document.getElementById('x-bpop')); }
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); setTimeout(run, 20); return out; };
    try { new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t && t.closest && (t.closest('#x-voice') || t.closest('#x-bpop') || t === document.body)) { setTimeout(run, 0); break; } } }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    setTimeout(run, 50);
  })();
})();
