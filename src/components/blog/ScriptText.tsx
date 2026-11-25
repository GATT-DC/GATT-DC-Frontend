// Texto donde las *palabras entre asteriscos* van en letra cursiva, como en
// "An Evening of *insight* and *dialogue*".
export default function ScriptText({ text, className = "font-script text-[1.2em]" }: { text: string; className?: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

// El mismo texto sin los asteriscos (para <title> y textos alternativos).
export function plainText(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
