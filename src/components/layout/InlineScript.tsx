// Script en linea que el navegador ejecuta mientras lee el HTML, antes del
// primer pintado. Si React vuelve a dibujar la pagina en el navegador, el
// script no se ejecuta otra vez; por eso alli se marca como text/plain, y
// React no avisa por un <script> que no correria (patron de la guia de
// Next.js "Preventing flash before hydration").
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
