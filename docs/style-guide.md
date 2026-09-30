# Guía de estilos

Reglas de tipografía y color del proyecto. Este documento es la fuente de verdad para la IA y el equipo al momento de implementar UI: qué tipografía usar, en qué tipo de texto, en qué tamaño, y qué colores aplican.

## Tipografías

| Fuente                 | Archivo                      | Licencia                                          | Uso                                                                      |
|------------------------|-------------------------------|-----------------------------------------------------|---------------------------------------------------------------------------|
| Pinyon Script Regular  | `PinyonScript-Regular.ttf`   | SIL Open Font License (OFL) — uso comercial libre  | Detalles en cursiva (acentos decorativos, no texto de lectura extensa)   |
| PP Radio Grotesk       | `RadioGrotesk-*.otf`         | Comercial — licencia comprada en pangrampangram.com | Títulos                                                                   |
| Fraunces               | Google Fonts (`next/font/google`) | SIL Open Font License (OFL) — uso comercial libre | Texto / párrafos (reemplazo de Eyes for Serifs, que era solo personal)  |
| Sistema (Helvetica Neue / San Francisco / Segoe UI) | N/A — font stack de sistema, sin archivo | N/A — no se distribuye ningún archivo de fuente | Botones y detalles de UI |

### Pinyon Script — Detalles en cursiva

- **Uso:** exclusivamente para detalles en cursiva / acentos decorativos (ej. una palabra destacada en un título, una firma, un elemento ornamental). **No usar** para párrafos, texto de lectura larga, botones ni formularios — es una fuente script, legible solo en tamaños grandes y fragmentos cortos.
- **Tamaño y peso:** no son fijos — varían según el módulo/componente. Ver [Tamaños y pesos por módulo](#tamaños-y-pesos-por-módulo).
- **Archivo:** ubicar en `src/fonts/PinyonScript-Regular.ttf`.
- **Licencia:** SIL Open Font License. Permite uso comercial y redistribución sin costo. Ver condiciones completas en el archivo `OFL.txt` que acompaña la descarga (debe conservarse junto a la fuente).
- **Degradado de color (uso en Hero, palabra "in"):** gradiente lineal horizontal (90°) usando los 6 colores de la paleta arcoíris, en este orden y paradas exactas:

  | Parada | Color     |
  |--------|-----------|
  | 0%     | Morado    |
  | 26%    | Azul      |
  | 40%    | Verde     |
  | 62%    | Amarillo  |
  | 79%    | Naranja   |
  | 100%   | Rojo      |

  Implementado con las variables CSS del tema (`var(--color-morado)`, etc.) para que se adapte automáticamente entre modo claro/oscuro.

### PP Radio Grotesk — Títulos

- **Uso:** títulos (h1, h2, h3, hero, encabezados de sección). No usar en párrafos ni botones.
- **Tamaño y peso:** no son fijos — varían según el módulo/componente. Ver [Tamaños y pesos por módulo](#tamaños-y-pesos-por-módulo).
- **Archivo:** ubicar en `src/fonts/` (ej. `RadioGrotesk-Regular.otf`, `RadioGrotesk-Bold.otf`, etc. — nombres exactos según los archivos entregados al comprar).
- **Licencia:** **Comercial, de pago** (~USD $40, comprada en pangrampangram.com). La versión gratuita de prueba es solo para uso personal — **no usar esos archivos gratuitos en este proyecto**, deben reemplazarse por los archivos de la licencia comprada antes de ir a producción.
- **Pendiente:** confirmar que la compra ya se realizó y subir el comprobante/licencia junto a los archivos (ej. `src/fonts/RadioGrotesk-LICENSE.pdf`) para trazabilidad.

### Fraunces — Texto / párrafos

- **Uso:** texto de lectura (párrafos, descripciones, contenido largo). Reemplaza a "Eyes for Serifs", que solo tenía licencia de uso personal.
- **Tamaño y peso:** no son fijos — varían según el módulo/componente. Ver [Tamaños y pesos por módulo](#tamaños-y-pesos-por-módulo). (Fraunces tiene ejes variables de peso y opsize — se puede ajustar óptico para texto pequeño vs. grande).
- **Implementación:** vía `next/font/google` (no requiere descargar archivos manualmente ni licenciar nada aparte):

  ```ts
  import { Fraunces } from "next/font/google";

  const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-fraunces",
  });
  ```

- **Licencia:** SIL Open Font License. Uso comercial libre, sin costo.

### Sistema (Helvetica Neue / San Francisco / Segoe UI) — Botones y detalles de UI

- **Uso:** botones, labels, inputs, navegación, elementos de interfaz cortos. No usar para títulos ni para párrafos de lectura larga (para eso están Radio Grotesk y Fraunces).
- **Tamaño y peso:** no son fijos — varían según el módulo/componente. Ver [Tamaños y pesos por módulo](#tamaños-y-pesos-por-módulo).
- **Implementación:** font stack de sistema, sin subir ningún archivo de fuente ni licenciar nada — el navegador usa la fuente nativa de cada plataforma:

  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  ```

- **Por qué así:** Helvetica Neue es propiedad de Monotype. Apple tiene licencia para incluirla como fuente de sistema en macOS/iOS, pero esa licencia no permite a terceros distribuir/embeber el archivo de la fuente en un sitio web (eso requeriría una licencia web comercial de Monotype, de costo alto/nivel empresa). Referenciarla por **nombre** en CSS (sin subir el archivo) es legal — el navegador solo la usa si ya está instalada localmente (Mac/iOS). En Windows no está instalada por defecto, por eso el stack cae a Segoe UI (la fuente nativa de Windows, visualmente limpia y neutra) y finalmente a Arial como fallback universal.
- **Licencia:** no aplica — no se distribuye ningún archivo, solo se referencia el nombre de fuentes ya instaladas en el sistema operativo del usuario.

## Tamaños y pesos por módulo

Los tamaños y pesos de fuente **no son fijos por tipografía** — cada módulo/componente define su propio tamaño y peso al implementarse. Esta tabla se va llenando a medida que se construye cada módulo; antes de implementar uno nuevo, revisar aquí si ya hay un valor definido para no inventar uno distinto.

| Módulo / componente | Tipografía | Tamaño | Peso |
|----------------------|------------|--------|------|
| Landing — History (párrafo) | Fraunces | 20px | 300 (light) |

## Paleta de colores

Paleta "arcoiris": 6 colores de acento, sin jerarquía entre ellos (ninguno es "el primario") — se usan de forma intercambiable según el contexto (ilustraciones, categorías, secciones, detalles decorativos). Cada color tiene una variante para modo claro y otra para modo oscuro.

| Nombre  | Modo claro | Modo oscuro |
|---------|------------|-------------|
| Rojo    | `#D54954`  | `#FA6F7A`   |
| Naranja | `#F3652C`  | `#F47A49`   |
| Amarillo| `#FFC700`  | `#FED440`   |
| Verde   | `#009948`  | `#23C46F`   |
| Azul    | `#3E7BE9`  | `#79A9FF`   |
| Morado  | `#9839FD`  | `#C58FFE`   |

### Color primario (botones / acciones)

| Nombre    | Valor     |
|-----------|-----------|
| Primario  | `#1F72FF` |

- **Uso:** botones y elementos de acción (ej. "Become a Member"). Fijo en ambos modos (no tiene variante de modo oscuro) — distinto del azul decorativo de la paleta arcoiris.

- **Uso:** ninguno tiene un rol fijo (no son "primario", "error", "éxito", etc.) — son acentos decorativos intercambiables. Si en el futuro se necesita un color con significado semántico (ej. error de formulario, confirmación de éxito), definirlo aparte y no asumir que corresponde a alguno de estos por su tono.
- **Modo oscuro:** cada color tiene su propia variante ya definida arriba — no derivar el modo oscuro automáticamente (ej. con opacidad o `filter`), usar el hex exacto de la tabla.
- **Implementación sugerida:** definir como CSS custom properties en `globals.css`, con la variante de modo oscuro dentro de `@media (prefers-color-scheme: dark)` o bajo un atributo `[data-theme="dark"]` si el modo se controla manualmente (switch de usuario) en vez de solo la preferencia del sistema.

  ```css
  :root {
    --color-rojo: #D54954;
    --color-naranja: #F3652C;
    --color-amarillo: #FFC700;
    --color-verde: #009948;
    --color-azul: #3E7BE9;
    --color-morado: #9839FD;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-rojo: #FA6F7A;
      --color-naranja: #F47A49;
      --color-amarillo: #FED440;
      --color-verde: #23C46F;
      --color-azul: #79A9FF;
      --color-morado: #C58FFE;
    }
  }
  ```

<!-- Pendiente: definir si el modo oscuro se controla por preferencia de sistema, switch manual, o ambos -->
