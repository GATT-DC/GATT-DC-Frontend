// Transicion entre la junta y el perfil de un miembro: la foto viaja de su
// tarjeta al perfil (y de vuelta) y lo demas entra escalonado.

const FLY_MS = 560;
const FLY_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const RISE_MS = 420;

// Mismo `sizes` para la foto en la tarjeta y en el perfil: el navegador elige
// la misma imagen y durante el viaje no hay parpadeo mientras carga.
export const MEMBER_PHOTO_SIZES = "(min-width: 1024px) 25vw, 340px";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// El elemento arranca dibujado sobre `from` y viaja a su lugar (FLIP). Va por
// encima del resto mientras dura el viaje.
export function flyFrom(el: HTMLElement, from: DOMRect) {
  // Sin animaciones previas, para medir su lugar real (en desarrollo React
  // corre los efectos dos veces y la segunda mediria la foto ya desplazada).
  el.getAnimations().forEach((animation) => animation.cancel());
  const to = el.getBoundingClientRect();
  if (!to.width) return;
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const scale = from.width / to.width;
  const zIndex = el.style.zIndex;
  el.style.zIndex = "20";
  const animation = el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, transformOrigin: "top left" },
      { transform: "none", transformOrigin: "top left" },
    ],
    { duration: FLY_MS, easing: FLY_EASE },
  );
  animation.finished
    .then(() => {
      el.style.zIndex = zIndex;
    })
    .catch(() => {});
}

// Los elementos aparecen de a uno, subiendo un poco.
export function riseIn(elements: Element[], startMs: number, stepMs: number) {
  elements.forEach((el, i) => {
    el.getAnimations().forEach((animation) => animation.cancel());
    el.animate(
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: RISE_MS,
        delay: startMs + i * stepMs,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      },
    );
  });
}
