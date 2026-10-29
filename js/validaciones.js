// Funciones puras: reciben un valor y devuelven un mensaje de error o null.
const limpio = v => String(v).replace(/[\s-]/g, '');
const letras = v => (String(v).match(/\p{L}/gu) || []).length;

function edad(iso) {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a) return 0;
  const hoy = new Date();
  let e = hoy.getFullYear() - a;
  if (hoy < new Date(hoy.getFullYear(), m - 1, d)) e--;
  return e;
}

const V = {
  marca: v => (v ? null : 'Elegí una marca'),
  modelo: v => (v.trim().length >= 2 && v.trim().length <= 40 ? null : 'Ingresá el modelo del equipo'),
  valor: v => (v >= 100000 && v <= 2500000 ? null : 'El valor debe estar entre $100.000 y $2.500.000'),
  antiguedad: v => (v ? null : 'Indicá la antigüedad'),
  nombre: v => (letras(v) >= 2 ? null : 'Ingresá tu nombre'),
  apellido: v => (letras(v) >= 2 ? null : 'Ingresá tu apellido'),
  dni: v => (/^\d{7,8}$/.test(v) ? null : 'El DNI debe tener 7 u 8 números'),
  nacimiento: v => (edad(v) >= 18 ? null : 'Tenés que ser mayor de edad'),
  email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Ingresá un email válido'),
  celular: v => (/^[1-9]\d{9}$/.test(limpio(v)) && !limpio(v).startsWith('15') ? null : 'Ej.: 11 5555-1234'),
  terminos: v => (v ? null : 'Tenés que aceptar los términos'),
  metodo: v => (v ? null : 'Elegí un medio de pago'),
  tarjeta: v => (/^\d{16}$/.test(String(v).replace(/\s/g, '')) ? null : 'Número de tarjeta inválido'),
  vencimiento: v => {
    const m = /^(\d\d)\/(\d\d)$/.exec(v);
    if (!m || +m[1] < 1 || +m[1] > 12) return 'Vencimiento inválido';
    return new Date(2000 + +m[2], +m[1], 1) > new Date() ? null : 'Vencimiento inválido';
  },
  cvv: v => (/^\d{3}$/.test(v) ? null : 'CVV inválido'),
  titular: v => (v.trim() ? null : 'Ingresá el nombre del titular'),
};

export const validar = (campo, valor) => V[campo](valor);
