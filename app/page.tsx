import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingReasons } from "@/components/landing/landing-reasons";

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      <LandingHero />
      <LandingReasons />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
