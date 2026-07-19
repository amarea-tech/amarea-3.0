import Navbar from "@/components/Navbar";
import GrowSection from "@/components/GrowSection";
import FooterSection from "@/components/FooterSection";
import { Helmet } from "react-helmet-async";

const GrowPage = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Grow With Amarea — Il meteo della tua pelle</title>
      <meta
        name="description"
        content="Il meteo cosmetico di Amarea: UV, umidità, particolato e pollini in tempo reale, tradotti in consigli scientifici per la cura quotidiana della pelle."
      />
      <link rel="canonical" href="https://amareacosmetics.com/grow" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://amareacosmetics.com/grow" />
      <meta property="og:title" content="Grow With Amarea — Il meteo della tua pelle" />
      <meta
        property="og:description"
        content="Il meteo cosmetico di Amarea: UV, umidità, particolato e pollini in tempo reale, tradotti in consigli scientifici per la cura quotidiana della pelle."
      />
    </Helmet>
    <Navbar />
    <GrowSection />
    <FooterSection />
  </div>
);

export default GrowPage;