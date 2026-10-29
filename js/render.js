import { solicitud as s } from './estado.js';
import { validar } from './validaciones.js';
import { planes, cuotaDe } from './cotizador.js';

const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const PASO_DE = { equipo: 1, titular: 3, pago: 4 };
const TITULOS = { 1: 'Contanos sobre tu celular', 2: 'Elegí tu plan', 3: 'Tus datos', 4: 'Pago' };
const TIT_MOVIL = { 1: 'Cotizá tu seguro', 2: 'Elegí tu plan', 3: 'Tus datos', 4: 'Pago' };
const ESCUDO = '<svg class="size-3.5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>';

// w: ancho completo · o: opciones (valor o [valor, texto])
export const CAMPOS = [
  { g: 'equipo', k: 'marca', l: 'Marca', t: 'select', o: ['Samsung', 'Apple', 'Motorola', 'Xiaomi', 'Otra'] },
  { g: 'equipo', k: 'modelo', l: 'Modelo', ph: 'Ej.: Galaxy A55' },
  { g: 'equipo', k: 'valor', l: 'Valor del equipo', ph: '$ 600.000', m: 'numeric', ayuda: 'Entre $100.000 y $2.500.000' },
  { g: 'equipo', k: 'antiguedad', l: 'Antigüedad', t: 'chips', o: ['Menos de 1 año', '1 a 2 años', ['Más de 2 años', '+2 años']] },
  { g: 'titular', k: 'nombre', l: 'Nombre', ph: 'Juan' },
  { g: 'titular', k: 'apellido', l: 'Apellido', ph: 'Pérez' },
  { g: 'titular', k: 'dni', l: 'DNI', ph: '30123456', m: 'numeric' },
  { g: 'titular', k: 'nacimiento', l: 'Fecha de nacimiento', type: 'date' },
  { g: 'titular', k: 'email', l: 'Email', type: 'email', ph: 'juan.perez@mail.com' },
  { g: 'titular', k: 'celular', l: 'Celular', type: 'tel', ph: '11 5555-1234', m: 'tel' },
  { g: 'titular', k: 'terminos', l: 'Acepto los términos y condiciones y la política de privacidad.', t: 'check', w: 1 },
  { g: 'pago', k: 'metodo', l: '', t: 'radios', o: [['credito', 'Tarjeta de crédito'], ['debito', 'Tarjeta de débito']], w: 1 },
  { g: 'pago', k: 'tarjeta', l: 'Número de tarjeta', ph: '4111 1111 1111 1111', m: 'numeric' },
  { g: 'pago', k: 'titular', l: 'Titular', ph: 'JUAN PEREZ' },
  { g: 'pago', k: 'vencimiento', l: 'Vencimiento', ph: 'MM/AA', m: 'numeric' },
  { g: 'pago', k: 'cvv', l: 'CVV', ph: '•••', m: 'numeric' },
];

const par = o => [].concat(o, o);
function campoHTML(c) {
  const a = `data-g="${c.g}" data-k="${c.k}"`, ey = `<p id="${c.k}-error" hidden></p>`;
  let h;
  if (c.t === 'select') {
    h = `<label for="${c.k}">${c.l}</label><select id="${c.k}" ${a} aria-describedby="${c.k}-error"><option value="">Elegí una opción</option>${c.o.map(o => `<option>${o}</option>`).join('')}</select>${ey}`;
  } else if (c.t === 'chips') {
    h = `<span class="text-[13px] font-semibold">${c.l}</span><div class="flex flex-wrap gap-2">${c.o.map(o => { const [v, t] = par(o);
      return `<label class="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-800 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-600"><input class="sr-only" type="radio" name="${c.k}" value="${v}" ${a}>${t}</label>`; }).join('')}</div>${ey}`;
  } else if (c.t === 'radios') {
    h = `<div class="grid gap-3 sm:grid-cols-2">${c.o.map(o => { const [v, t] = par(o);
      return `<label class="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold has-[:checked]:border-indigo-600 has-[:checked]:ring-1 has-[:checked]:ring-indigo-600"><input type="radio" name="${c.k}" value="${v}" ${a}>${t}</label>`; }).join('')}</div>${ey}`;
  } else if (c.t === 'check') {
    h = `<label><input type="checkbox" id="${c.k}" ${a} aria-describedby="${c.k}-error">${c.l}</label>${ey}`;
  } else {
    h = `<label for="${c.k}">${c.l}</label><input id="${c.k}" ${a} type="${c.type || 'text'}" placeholder="${c.ph || ''}" ${c.m ? `inputmode="${c.m}"` : ''} autocomplete="off" aria-describedby="${c.k}-error">${ey}`;
  }
  return `<div role="group" class="field ${c.w ? 'col-span-full' : ''}" data-campo="${c.k}">${h}</div>`;
}

export function montarCampos() {
  $$('[data-campos]').forEach(box => { box.innerHTML = CAMPOS.filter(c => c.g === box.dataset.campos).map(campoHTML).join(''); });
}
export function montarPies() {
  $$('[data-pie]').forEach(p => {
    p.innerHTML = `<div class="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 lg:flex-row lg:items-center">
      <button type="button" class="btn max-lg:hidden" data-variant="outline" data-volver>Volver</button>
      <div class="flex flex-col gap-2 lg:ml-auto lg:flex-row lg:items-center lg:gap-4">
        <p data-ayuda class="text-center text-xs text-slate-500 lg:text-right" hidden></p>
        <button type="button" class="btn w-full lg:w-auto lg:min-w-48" data-sig>${p.dataset.pie}</button></div></div>`;
  });
}

const ORDEN = ['Robo con violencia', 'Rotura de pantalla', 'Hurto / pérdida'];
const EQUIV = { 'Rotura total': 'Rotura de pantalla' };
export function montarPlanes() {
  $('#planes').innerHTML = planes.map(p => {
    const cubre = new Set(p.coberturas.flatMap(c => [c, EQUIV[c]].filter(Boolean)));
    const faltan = ORDEN.filter(c => !cubre.has(c));
    return `<label class="relative block cursor-pointer">
      <input type="radio" name="plan" value="${p.id}" class="peer absolute right-4 top-4 z-10" data-plan>
      <div class="card gap-3 p-4 peer-checked:border-indigo-600 peer-checked:ring-1 peer-checked:ring-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600">
        <span class="flex items-center gap-2 pr-8"><b>${p.nombre}</b>${p.recomendado ? '<span class="badge">Recomendado</span>' : ''}</span>
        <span><b class="text-2xl font-extrabold" data-cuota="${p.id}"></b><span class="text-xs text-slate-500"> / mes</span></span>
        <ul class="grid gap-1.5 border-t border-slate-200 pt-3 text-sm">
          ${p.coberturas.map(c => `<li><span class="text-emerald-600">✓</span> ${c}</li>`).join('')}
          ${faltan.map(c => `<li class="text-slate-400"><span>✕</span> ${c}</li>`).join('')}</ul>
      </div></label>`;
  }).join('');
}

// ---------- Validación ----------
const valorDe = c => s[c.g][c.k];
export const errores = paso => CAMPOS.filter(c => PASO_DE[c.g] === paso).map(c => [c, validar(c.k, valorDe(c))]).filter(([, m]) => m);

function renderCampos() {
  CAMPOS.forEach(c => {
    const box = $(`[data-campo="${c.k}"]`), v = valorDe(c);
    const msg = s.tocados[c.k] ? validar(c.k, v) : null;
    $$('[data-k]', box).forEach(el => {
      if (el.type === 'checkbox') el.checked = v;
      else if (el.type === 'radio') el.checked = el.value === v;
      else { const t = c.k === 'valor' ? (v ? ars.format(v) : '') : v; if (el.value !== t) el.value = t; }
      el.setAttribute('aria-invalid', !!msg);
    });
    box.toggleAttribute('data-invalid', !!msg);
    const p = $('p', box);
    p.textContent = msg || c.ayuda || '';
    p.hidden = !p.textContent;
    p.setAttribute('role', msg ? 'alert' : 'note');
  });
}

function renderPies() {
  [1, 3, 4].forEach(n => {
    const sec = $(`[data-paso="${n}"]`), falta = errores(n);
    const btn = $('[data-sig]', sec), ayuda = $('[data-ayuda]', sec);
    btn.disabled = falta.length > 0 || (n === 4 && s.procesando);
    if (n === 4) btn.textContent = s.procesando ? 'Procesando…' : 'Pagar y contratar';
    $('[data-volver]', sec).disabled = s.procesando;
    ayuda.textContent = falta.length ? `Falta completar: ${falta.map(([c]) => (c.k === 'terminos' ? 'términos' : c.l).toLowerCase()).join(', ')}.` : '';
    ayuda.hidden = !falta.length;
  });
}

export function renderStepper() {
  const el = $('#stepper');
  el.innerHTML = ['Cotizar', 'Plan', 'Datos', 'Pago'].map((t, i) => {
    const n = i + 1, est = n < s.paso ? 'ok' : n === s.paso ? 'act' : 'pen';
    const dot = { ok: 'bg-emerald-600 text-white', act: 'bg-indigo-600 text-white', pen: 'border border-slate-300 bg-white text-slate-500' }[est];
    const txt = { ok: 'text-emerald-600', act: 'text-indigo-600', pen: 'text-slate-500' }[est];
    return `<li class="flex items-center gap-1.5 ${n < 4 ? 'flex-1' : ''}" ${est === 'act' ? 'aria-current="step"' : ''}>
      <span class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] ${dot}">${est === 'ok' ? '✓' : n}</span><span class="${txt}">${t}</span>
      ${n < 4 ? `<span class="h-px flex-1 ${est === 'ok' ? 'bg-emerald-600' : 'bg-slate-200'}"></span>` : ''}</li>`;
  }).join('');
}

export function renderResumen() {
  const p = planes.find(x => x.id === s.plan), con = s.paso >= 2 && p;
  const cuota = con && s.equipo.valor ? ars.format(cuotaDe(p)) : '—';
  const eq = [s.equipo.marca, s.equipo.modelo].filter(Boolean).join(' ') || '—';
  const filas = [['Seguro', 'Celular'], ['Equipo', eq]];
  if (s.paso === 1) filas.push(['Valor', s.equipo.valor ? ars.format(s.equipo.valor) : '—']);
  else filas.push(['Plan', con ? p.nombre : '—']);
  if (s.paso === 4 && s.titular.nombre) filas.push(['Titular', `${s.titular.nombre} ${s.titular.apellido}`]);
  $('#resumen').innerHTML = `<div class="card gap-0 py-4 max-lg:rounded-none max-lg:border-x-0 max-lg:py-3">
    <header class="max-lg:hidden"><h2>Resumen</h2></header>
    <section class="grid gap-1.5 text-sm">
      ${filas.map(([a, b]) => `<div class="flex justify-between max-lg:hidden"><span class="text-slate-500">${a}</span><b>${esc(b)}</b></div>`).join('')}
      ${s.paso === 1 ? '<p class="mt-1 text-xs text-slate-500 max-lg:hidden">Completá los datos del equipo para ver el precio.</p>' : ''}
      <div class="flex justify-between lg:hidden"><span class="text-slate-500">${con ? `Plan ${p.nombre} · ` : ''}${esc(eq)}</span><b>${cuota === '—' ? '—' : cuota + '/mes'}</b></div>
      ${s.paso >= 2 ? `<div class="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 max-lg:hidden"><span class="text-slate-500">Total mensual</span><b class="text-lg">${cuota}</b></div>` : ''}
      <p class="mt-2 flex items-center gap-1.5 text-xs text-slate-500 max-lg:hidden">${ESCUDO}Contratación 100% online · cancelás cuando quieras</p>
    </section></div>`;
}

function renderPlanes() {
  planes.forEach(p => { const c = $(`[data-cuota="${p.id}"]`); if (c) c.textContent = ars.format(cuotaDe(p)); });
  $$('[data-plan]').forEach(r => { r.checked = r.value === s.plan; });
}

function renderExito() {
  const p = planes.find(x => x.id === s.plan);
  const out = { nombre: s.titular.nombre, email: s.titular.email, poliza: s.poliza, plan: p?.nombre,
    equipo: [s.equipo.marca, s.equipo.modelo].join(' '), vigencia: new Date().toLocaleDateString('es-AR'), cuota: p ? ars.format(cuotaDe(p)) : '' };
  $$('[data-out]').forEach(el => { el.textContent = out[el.dataset.out] ?? ''; });
}

function renderCuenta() {
  const p = planes.find(x => x.id === s.plan);
  $('#cuenta').innerHTML = s.poliza && p
    ? `<div class="card p-5"><b class="text-indigo-800">${s.poliza}</b>
        <dl class="grid gap-1 text-sm">${[['Titular', `${s.titular.nombre} ${s.titular.apellido}`], ['Email', s.titular.email], ['Seguro', 'Celular'], ['Equipo', [s.equipo.marca, s.equipo.modelo].join(' ')], ['Plan', p.nombre], ['Cuota mensual', ars.format(cuotaDe(p))]]
          .map(([a, b]) => `<div class="flex justify-between"><dt class="text-slate-500">${a}</dt><dd class="font-semibold">${esc(b)}</dd></div>`).join('')}</dl></div>`
    : '<div class="card p-5"><p class="text-slate-500">Todavía no tenés seguros contratados.</p><button type="button" class="btn w-fit" data-ir="1">Cotizar un seguro</button></div>';
}

export function render() {
  const paso = s.paso, enPaso = paso >= 1 && paso <= 4;
  $$('[data-paso]').forEach(x => { x.hidden = Number(x.dataset.paso) !== paso; });
  $('#checkout').hidden = !enPaso;
  $('#cabecera').hidden = !enPaso;
  if (enPaso) {
    $('#titulo').textContent = TITULOS[paso];
    $('#titulo').classList.toggle('max-lg:hidden', paso !== 1);
    $('#hdr-title').textContent = TIT_MOVIL[paso];
  }
  $('#hdr-back').hidden = !(enPaso || paso >= 7);
  $('#hdr-title').hidden = !enPaso;
  $('#hdr-logo').classList.toggle('max-lg:hidden', enPaso);
  $$('[data-nav]').forEach(b => Number(b.dataset.ir) === paso
  ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));$$('[data-nav]').forEach(b => b.toggleAttribute('aria-current', Number(b.dataset.ir) === paso));
  renderCampos();
  renderPlanes();
  renderPies();
  renderStepper();
  renderResumen();
  if (paso === 5) renderExito();
  if (paso === 9) renderCuenta();
}

function renderExito() {
  const p = planes.find(x => x.id === s.plan);
  const out = { nombre: s.titular.nombre, email: s.titular.email, poliza: s.poliza, plan: p?.nombre,
    equipo: [s.equipo.marca, s.equipo.modelo].join(' '), vigencia: new Date().toLocaleDateString('es-AR'), cuota: p ? ars.format(cuotaDe(p)) : '' };
  $$('[data-out]').forEach(el => { el.textContent = out[el.dataset.out] ?? ''; });
}

function renderCuenta() {
  const p = planes.find(x => x.id === s.plan);
  $('#cuenta').innerHTML = s.poliza && p
    ? `<div class="card p-5"><b class="text-indigo-800">${s.poliza}</b>
        <dl class="grid gap-1 text-sm">${[['Titular', `${s.titular.nombre} ${s.titular.apellido}`], ['Email', s.titular.email], ['Seguro', 'Celular'], ['Equipo', [s.equipo.marca, s.equipo.modelo].join(' ')], ['Plan', p.nombre], ['Cuota mensual', ars.format(cuotaDe(p))]]
          .map(([a, b]) => `<div class="flex justify-between"><dt class="text-slate-500">${a}</dt><dd class="font-semibold">${esc(b)}</dd></div>`).join('')}</dl></div>`
    : '<div class="card p-5"><p class="text-slate-500">Todavía no tenés seguros contratados.</p><button type="button" class="btn w-fit" data-ir="1">Cotizar un seguro</button></div>';
}

export function render() {
  const paso = s.paso, enPaso = paso >= 1 && paso <= 4;
  $$('[data-paso]').forEach(x => { x.hidden = Number(x.dataset.paso) !== paso; });
  $('#checkout').hidden = !enPaso;
  $('#cabecera').hidden = !enPaso;
  if (enPaso) {
    $('#titulo').textContent = TITULOS[paso];
    $('#titulo').classList.toggle('max-lg:hidden', paso !== 1);
    $('#hdr-title').textContent = TIT_MOVIL[paso];
  }
  $('#hdr-back').hidden = !enPaso;
  $('#hdr-title').hidden = !enPaso;
  $('#hdr-logo').classList.toggle('max-lg:hidden', enPaso);
  $$('[data-nav]').forEach(b => Number(b.dataset.ir) === paso
  ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));$$('[data-nav]').forEach(b => b.toggleAttribute('aria-current', Number(b.dataset.ir) === paso));
  renderCampos();
  renderPlanes();
  renderPies();
  renderStepper();
  renderResumen();
  if (paso === 5) renderExito();
  if (paso === 9) renderCuenta();
}
