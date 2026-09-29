import ScrollPager from "@/components/layout/ScrollPager";
import StackSection from "@/components/layout/StackSection";
import Description from "@/components/sections/Description";
import Hero from "@/components/sections/Hero";

const SECTION_COUNT = 2;

export default function Home() {
  return (
    <main>
      <ScrollPager sectionCount={SECTION_COUNT}>
        <StackSection zIndex={10}>
          <Hero index={0} />
        </StackSection>
        <StackSection zIndex={20}>
          <Description index={1} />
        </StackSection>
      </ScrollPager>
    </main>
  );
}
