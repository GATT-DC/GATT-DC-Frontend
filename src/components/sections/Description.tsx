import StaggerText from "@/components/layout/StaggerText";
import { rainbowGradient } from "@/lib/gradients";

export default function Description({ index }: { index: number }) {
  return (
    <section
      id="description"
      className="relative flex h-full w-full items-center overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover grayscale"
      >
        <source
          src="/images/landing/description/description.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center sm:px-10">
        <p className="font-heading font-normal leading-[1.1] text-white text-[48px]">
          <StaggerText
            index={index}
            lines={[
              <span key="line-1">
                Connecting LGBTQ+ professionals and allies across
                international trade to build a stronger community, expand
                opportunity, and shape a more inclusive future for
              </span>,
              <span
                key="global-commerce"
                className="font-script -mt-11 inline-block bg-clip-text pl-6 pr-1 pt-4 text-[1.6em] leading-normal text-transparent"
                style={{ backgroundImage: rainbowGradient }}
              >
                global commerce
              </span>,
            ]}
          />
        </p>
      </div>
    </section>
  );
}
