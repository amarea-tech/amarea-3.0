import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FloatingPetals from "@/components/FloatingPetals";

const PhilosophySection = lazy(() => import("@/components/PhilosophySection"));
const ProductsSection = lazy(() => import("@/components/ProductsSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const NewsletterBlock = lazy(() => import("@/components/NewsletterBlock"));
const CollaboraSection = lazy(() => import("@/components/CollaboraSection"));
const FooterSection = lazy(() => import("@/components/FooterSection"));

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Amarea Cosmetics — Skincare scientifica e sostenibile dalle Marche</title>
        <meta
          name="description"
          content="Amarea Cosmetics: spin-off dell'Università Politecnica delle Marche. Skincare scientifica con attivi botanici da upcycling, formulata nel cuore delle Marche."
        />
        <link rel="canonical" href="https://amareacosmetics.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://amareacosmetics.com/" />
        <meta property="og:title" content="Amarea Cosmetics — Skincare scientifica e sostenibile dalle Marche" />
        <meta
          property="og:description"
          content="Skincare scientifica con attivi botanici da upcycling, dal cuore delle Marche. Scopri la filosofia, il team di ricerca e la collezione Monti Italiani."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://amareacosmetics.com/" },
            ],
          })}
        </script>
      </Helmet>
      <Navbar />
      <div className="relative">
        <FloatingPetals />
        <HeroSection />
      </div>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <PhilosophySection />
        <AboutSection />
        <ProductsSection />
        <NewsletterBlock />
        <TeamSection />
        <CollaboraSection />
        <FooterSection />
      </Suspense>
    </div>
  );
};

export default Index;
