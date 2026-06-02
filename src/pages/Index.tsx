import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FloatingPetals from "@/components/FloatingPetals";

const PhilosophySection = lazy(() => import("@/components/PhilosophySection"));
const ProductsSection = lazy(() => import("@/components/ProductsSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const NewsletterBlock = lazy(() => import("@/components/NewsletterBlock"));
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
      <Navbar />
      <div className="relative">
        <FloatingPetals />
        <HeroSection />
      </div>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <PhilosophySection />
        <ProductsSection />
        <NewsletterBlock />
        <AboutSection />
        <TeamSection />
        <FooterSection />
      </Suspense>
    </div>
  );
};

export default Index;
