import { solicitud as s, irAPaso, reiniciar } from './estado.js';
import { cargarPlanes } from './cotizador.js';
import { simularPago, generarPoliza } from './pago.js';
import { render, errores, montarCampos, montarPies, montarPlanes } from './render.js';

const CATALOGO = [
  ['Celular', 'Robo, rotura y pérdida', 'desde $2.000/mes', '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>', true],
  ['Hogar', 'Incendio y robo', 'desde $5.500/mes', '<path d="M3 11l9-8 9 8v10H3z"/>'],
  ['Bicicleta', 'Robo total', 'desde $1.800/mes', '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8H8"/>'],
  ['Viaje', 'Asistencia al viajero', 'desde $900/día', '<path d="M2 12l20-8-6 16-4-6z"/>'],
];
const MASCARA = {
  valor: v => Number(v.replace(/\D/g, '').slice(0, 7)),
  dni: v => v.replace(/\D/g, '').slice(0, 8),
  tarjeta: v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  vencimiento: v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; },
  cvv: v => v.replace(/\D/g, '').slice(0, 3),
};

function cambio(e) {
  const el = e.target;
  if (el.dataset.plan !== undefined) { s.plan = el.value; return render(); }
  const { g, k } = el.dataset;
  if (!k) return;
  s[g][k] = el.type === 'checkbox' ? el.checked : (MASCARA[k] ? MASCARA[k](el.value) : el.value);
  if (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') s.tocados[k] = true;
  render();
}

async function pagar() {
  if (s.procesando) return;
  s.procesando = true; // evita el doble click
  render();
  const res = await simularPago(s.pago.tarjeta);
  s.procesando = false;
  if (res.ok) { s.poliza = generarPoliza(); irAPaso(5); } else irAPaso(6);
}

function clicks(e) {
  const b = e.target.closest('button'); if (!b || s.procesando) return;
  if (b.dataset.ir) irAPaso(Number(b.dataset.ir));
  else if (b.dataset.volver !== undefined) irAPaso(s.paso - 1);
  else if (b.dataset.reiniciar !== undefined) reiniciar();
  else if (b.dataset.descargar !== undefined) window.print();
  else if (b.dataset.cambiar !== undefined) { irAPaso(4); document.querySelector('[name="metodo"]:checked')?.focus(); }
  else if (b.dataset.sig !== undefined) {
    const fallan = errores(s.paso);
    if (fallan.length) {
      fallan.forEach(([c]) => { s.tocados[c.k] = true; });
      render();
      document.querySelector(`[data-k="${fallan[0][0].k}"]`)?.focus();
      return;
    }
    s.paso === 4 ? pagar() : irAPaso(s.paso + 1);
  }
}

async function iniciar() {
  document.getElementById('catalogo').innerHTML = CATALOGO.map(([n, sub, precio, ic, on]) => `
    <button type="button" class="card gap-0 p-4 text-left ${on ? 'border-indigo-600' : 'opacity-70'}" ${on ? 'data-ir="1"' : 'disabled'}>
      <span class="mb-6 grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg></span>
      <b>${n}</b><span class="text-xs text-slate-500">${sub}</span><span class="mt-1 text-xs font-semibold text-indigo-600">${precio}</span>
      ${on ? '' : '<span class="badge mt-2 w-fit" data-variant="outline">Próximamente</span>'}</button>`).join('');
  montarCampos();
  montarPies();
  render();
  document.addEventListener('input', cambio);
  document.addEventListener('change', cambio);
  document.addEventListener('focusout', e => { const k = e.target.dataset?.k; if (k) { s.tocados[k] = true; render(); } });
  document.addEventListener('click', clicks);
  try { await cargarPlanes(); montarPlanes(); }
  catch { document.getElementById('planes').innerHTML = '...tu mensaje de error...'; }
  render();
}
iniciar();
