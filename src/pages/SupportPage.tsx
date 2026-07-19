import Navbar from "@/components/Navbar";
import GardenSection from "@/components/GardenSection";
import { Helmet } from "react-helmet-async";

const SupportPage = () => {
  return (
    <>
      <Helmet>
        <title>Sostieni Amarea — Il Giardino di Amarea</title>
        <meta
          name="description"
          content="Sostieni la ricerca scientifica di Amarea Cosmetics con una donazione libera. Il Giardino di Amarea raccoglie contributi per continuare la ricerca su attivi botanici sostenibili dalle Marche."
        />
        <link rel="canonical" href="https://amareacosmetics.com/sostieni-amarea" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://amareacosmetics.com/sostieni-amarea" />
        <meta property="og:title" content="Sostieni Amarea — Il Giardino di Amarea" />
        <meta
          property="og:description"
          content="Contribuisci alla ricerca di Amarea Cosmetics con una donazione libera. Il Giardino di Amarea sostiene lo sviluppo di cosmesi scientifica dalle Marche."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://amareacosmetics.com/" },
              { "@type": "ListItem", position: 2, name: "Sostieni Amarea", item: "https://amareacosmetics.com/sostieni-amarea" },
            ],
          })}
        </script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="h-20" />
        <GardenSection />
      </main>
    </>
  );
};

export default SupportPage;
