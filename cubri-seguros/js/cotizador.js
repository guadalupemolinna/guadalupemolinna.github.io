import { solicitud } from './estado.js';

export const FACTOR = { 'Menos de 1 año': 1, '1 a 2 años': 1.1, 'Más de 2 años': 1.25 };
export const planes = [];

export async function cargarPlanes() {
  const res = await fetch('data/planes.json');
  if (!res.ok) throw new Error('No se pudo cargar planes.json');
  planes.push(...(await res.json()));
}

// Única fuente de verdad del precio (resumen y planes usan esta función).
export function calcularCuota(valor, tasaAnual, antiguedad) {
  return Math.round((valor * tasaAnual / 12) * (FACTOR[antiguedad] ?? 1));
}

export const cuotaDe = plan => calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad);
