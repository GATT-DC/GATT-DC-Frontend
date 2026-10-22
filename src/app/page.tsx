import ScrollPager from "@/components/layout/ScrollPager";
import StackSection from "@/components/layout/StackSection";
import Comments from "@/components/sections/Comments";
import Description from "@/components/sections/Description";
import DiscoverGatt from "@/components/sections/DiscoverGatt";
import Hero from "@/components/sections/Hero";
import History from "@/components/sections/History";
import MonthlyNetworking from "@/components/sections/MonthlyNetworking";
import WhereItAllBegan from "@/components/sections/WhereItAllBegan";

const SECTION_COUNT = 2;

export default function Home() {
  return (
    <main>
      {/* Contenedor propio para que las secciones sticky se liberen al
          terminar el paginado y el contenido siguiente quede debajo. */}
      <div>
        <ScrollPager sectionCount={SECTION_COUNT}>
          <StackSection zIndex={10}>
            <Hero index={0} />
          </StackSection>
          <StackSection zIndex={20}>
            <Description index={1} />
          </StackSection>
        </ScrollPager>
      </div>
      <History />
      <WhereItAllBegan />
      <DiscoverGatt />
      <Comments />
      <MonthlyNetworking />
    </main>
  );
}
