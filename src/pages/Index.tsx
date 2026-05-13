import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import FooterSection from "@/components/FooterSection";
import FloatingPetals from "@/components/FloatingPetals";

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
      <PhilosophySection />
      <ProductsSection />
      <AboutSection />
      <TeamSection />
      <FooterSection />
    </div>
  );
};

export default Index;
