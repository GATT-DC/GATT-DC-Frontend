import Navbar from "@/components/layout/Navbar";

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover grayscale"
      >
        <source src="/images/landing/hero/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <Navbar />

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center sm:px-10">
        <h1 className="font-heading font-normal leading-none tracking-[0.02em] text-white text-[40px] sm:text-[64px] lg:text-[95px]">
          <span className="block">LGBTQ+ Professional</span>
          <span className="block">
            <span
              className="font-script inline-block bg-clip-text px-2 text-[1.5em] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--color-morado) 0%, var(--color-azul) 26%, var(--color-verde) 40%, var(--color-amarillo) 62%, var(--color-naranja) 79%, var(--color-rojo) 100%)",
              }}
            >
              in
            </span>{" "}
            International Trade
          </span>
        </h1>
      </div>
    </section>
  );
}
