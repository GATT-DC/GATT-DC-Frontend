// Trozo de cinta adhesiva de papel que sujeta una foto. Los extremos van
// dentados, como cortados a mano.
export default function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block bg-[#efe3c2]/85 shadow-[0_1px_2px_rgba(0,0,0,0.18)] ${className}`}
      style={{
        clipPath:
          "polygon(0 8%, 4% 0, 8% 10%, 12% 0, 88% 0, 92% 10%, 96% 0, 100% 8%, 100% 92%, 96% 100%, 92% 90%, 88% 100%, 12% 100%, 8% 90%, 4% 100%, 0 92%)",
      }}
    />
  );
}
