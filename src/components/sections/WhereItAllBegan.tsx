import Image from "next/image";

export default function WhereItAllBegan() {
  return (
    <section
      id="where-it-all-began"
      className="relative flex w-full flex-col gap-10 bg-fondo pb-24 pt-12 lg:flex-row lg:items-center lg:gap-20 lg:pr-10"
    >
      <div className="w-full lg:w-[min(72vw,120vh)] lg:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]">
          <Image
            src="/images/landing/where-it-all-began/1.png"
            alt="Members of GATT gathered around a table in the early days of the group"
            fill
            sizes="(min-width: 1024px) 72vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <h2 className="font-heading absolute inset-0 flex items-center justify-center px-6 text-center text-[32px] font-normal leading-none text-white sm:text-[40px] lg:text-[48px]">
            <span>
              Where It All{" "}
              <span className="font-script inline-block pl-2 pr-1 text-[1.3em] leading-normal text-morado">
                began
              </span>
            </span>
          </h2>
        </div>
        <div className="mt-3 h-px w-full bg-white/15">
          <div className="h-full w-[12%] bg-white/60" />
        </div>
      </div>

      <p className="font-serif px-6 text-[18px] font-light leading-[1.3] text-white lg:max-w-[300px] lg:px-0">
        In 1986, at a time when being openly gay in the workplace was not
        acceptable, a group of LGBTQ+ professionals in international trade
        decided to meet outside of work for a drink. Not surprisingly, much of
        the conversation centered on current events in international trade and
        impacts on peoples’ jobs and organizations. The evening was so
        enjoyable that the group decided to meet again and, eventually, these
        meet ups became regular occurrences. Over time, the group grew as
        individuals invited friends and acquaintances from government and the
        private sector to join in on the industry gossip.
      </p>
    </section>
  );
}
