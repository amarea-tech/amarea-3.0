import Navbar from "@/components/Navbar";
import GrowSection from "@/components/GrowSection";
import FooterSection from "@/components/FooterSection";
import { Helmet } from "react-helmet-async";

const GrowPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Grow With Amarea — Skin Weather Dashboard</title>
      <meta
        name="description"
        content="Insight ambientali scientifici per la tua pelle: UV, umidità, particolato e pollini tradotti in protocolli cosmetici eleganti."
      />
      <link rel="canonical" href="https://amareacosmetics.it/grow" />
    </Helmet>
    <Navbar />
    <GrowSection />
    <FooterSection />
  </div>
);

export default GrowPage;