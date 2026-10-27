import StaggerText from "@/components/layout/StaggerText";
import { rainbowGradient } from "@/lib/gradients";

export default function Hero({ index }: { index: number }) {
  return (
    <section id="hero" className="relative h-full w-full overflow-hidden">
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

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center sm:px-10">
        <h1 className="font-heading font-normal leading-none tracking-[0.02em] text-white text-[40px] sm:text-[64px] lg:text-[95px]">
          <StaggerText
            index={index}
            lines={[
              "LGBTQ+ Professionals",
              <span key="line-2">
                <span
                  className="font-script inline-block bg-clip-text px-2 text-[1.5em] tracking-[-0.005em] text-transparent"
                  style={{ backgroundImage: rainbowGradient }}
                >
                  in
                </span>{" "}
                International Trade
              </span>,
            ]}
          />
        </h1>
      </div>
    </section>
  );
}
