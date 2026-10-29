# Cubrí Seguros · Flujo de contratación digital (Seguro de Celular)

TP5 · Diseño UXUI 2026 · Individual. Checkout multipaso (Cotizar → Plan → Datos → Pago) con pantallas de éxito y error, mobile first (390) y desktop (1440).

- **Sitio publicado:** _(agregar URL)_
- **Diseño:** [Figma](https://www.figma.com/design/vJrfOUfiOI7OSeTtRfCloh)

## Stack
HTML5 · Tailwind CSS v4 (CDN) · Basecoat UI 1.1.0 (solo CSS) · JavaScript vanilla (módulos ES), sin frameworks.

## Cómo correrlo
Los planes se cargan con `fetch`, así que **no abrir con doble click (file://)**. Usar Live Server o:
```
npx serve
```

## Estructura
```
index.html          # una sola página; cada paso es una <section data-paso>
css/tokens.css      # variables de Basecoat (primary, radius) y fondo
data/planes.json    # planes y tasas
js/app.js           # arranque, eventos y navegación
js/estado.js        # objeto solicitud + irAPaso()/reiniciar()
js/render.js        # pinta cada paso, stepper y resumen desde el estado
js/validaciones.js  # funciones puras: valor → mensaje o null
js/cotizador.js     # calcularCuota() (única fuente del precio)
js/pago.js          # simularPago() y generarPoliza()
```

## Decisiones
- **Un único estado** (`solicitud`): cada evento lo modifica y llama a `render()`. Los inputs se rellenan desde el estado, por eso "Volver" y "Reintentar pago" conservan los datos.
- **Resumen generado una sola vez** (`renderResumen()`): card lateral en desktop, barra fija inferior en mobile.
- **Validación en blur**, revalidando mientras se escribe en campos ya tocados. Los botones "Ver planes", "Continuar al pago" y "Pagar y contratar" quedan deshabilitados con un texto que indica qué falta.
- **Pago**: botón en "Procesando…" y deshabilitado 1,5 s (sin doble click).
- Accesibilidad: `label for`, `aria-invalid`, `role="alert"`, `aria-describedby`, `aria-current="step"` en el stepper.

## Casos de prueba (sección 5.1)
| Valor | Antigüedad | Básico | Plus | Premium |
|---|---|---|---|---|
| $ 600.000 | Menos de 1 año | $ 2.000 | $ 3.000 | $ 4.500 |
| $ 600.000 | 1 a 2 años | $ 2.200 | $ 3.300 | $ 4.950 |
| $ 1.200.000 | Más de 2 años | $ 5.000 | $ 7.500 | $ 11.250 |

Tarjetas de prueba: `4111 1111 1111 1111` aprueba · `4000 0000 0000 0002` rechaza.

## Bonus
- Máscaras de input: tarjeta en grupos de 4 y vencimiento con barra automática.

## Capturas
| Mobile (390) | Desktop (1440) |
|---|---|
| _(agregar)_ | _(agregar)_ |
