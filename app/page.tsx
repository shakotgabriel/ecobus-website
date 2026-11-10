import { HeroSection } from "@/components/hero-section";
import { WhyChooseUs } from "@/components/why-choose-us";
import { DestinationsSection } from "@/components/destinations-section";
import { FleetGallery } from "@/components/fleet-gallery";
import { CTASection } from "@/components/cta-section";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <WhyChooseUs />
      <DestinationsSection />
      <FleetGallery />
      <CTASection />
    </main>
  );
}
