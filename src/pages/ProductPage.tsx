import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import productConero from "@/assets/product-conero.jpg";
import productSibilla from "@/assets/product-sibilla.jpg";
import productCatria from "@/assets/product-catria.jpg";

const productData: Record<string, { name: string; desc: string; details: string; gradient: string; subtitle: string; image: string }> = {
  conero: {
    name: "Conero",
    subtitle: "Purifying Face Cream",
    desc: "La nostra crema idratante che nutre e mantiene la pelle morbida e protetta, ispirata alla natura del Monte Conero.",
    details: "I protagonisti di questa crema purificante sono le foglie d'ulivo, derivanti dall'industria olearia e la niacinamide. Ideale per pelli miste e grasse.",
    gradient: "from-primary/20 to-lime/20",
    image: productConero,
  },
  sibilla: {
    name: "Sibilla",
    subtitle: "Anti-Age Cream",
    desc: "La nostra crema antiage che aiuta a contrastare i segni del tempo, formulata con estratti botanici dei Monti Sibillini.",
    details: "La nostra crema di punta, anti-age. L'ingrediente che impreziosisce la formula sono i tepali di zafferano, raccolti rigorosamente a mano durante la stagione di fioritura.",
    gradient: "from-violet/20 to-primary/20",
    image: productSibilla,
  },
  catria: {
    name: "Catria",
    subtitle: "Nourishing Face Cream",
    desc: "Una crema nutriente che rigenera e protegge la pelle in profondità, con ingredienti naturali del Monte Catria.",
    details: "Una crema idratante e nutriente che associa i benefici dei residui del caffè, con quelli dell'olio di girasole. Per chi vuole una pelle morbida e setosa.",
    gradient: "from-secondary/20 to-coral/20",
    image: productCatria,
  },
};

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? productData[slug] : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-6xl font-extrabold text-foreground mb-4">404</p>
          <p className="text-muted-foreground font-body text-lg">Prodotto non trovato.</p>
          <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground font-body font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className={`pt-28 pb-16 bg-gradient-to-br ${product.gradient} min-h-[80vh] flex items-center`}>
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/#prodotti"
              className="inline-flex items-center gap-2 font-body font-medium text-foreground/60 hover:text-foreground bg-background/50 backdrop-blur-sm px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-background mb-10"
            >
              <ArrowLeft size={16} />
              Torna alla home
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="overflow-hidden rounded-3xl bg-card shadow-2xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={1024}
                height={1024}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block bg-primary text-primary-foreground text-xs tracking-wide uppercase font-body font-bold px-5 py-2 rounded-full mb-6">
                Prossimamente ✨
              </span>
              <h1 className="font-display text-5xl md:text-7xl font-extrabold text-foreground mb-2">{product.name}</h1>
              <p className="font-body text-lg text-violet font-semibold mb-6">{product.subtitle}</p>
              <p className="font-body text-xl text-muted-foreground leading-relaxed mb-4">{product.desc}</p>
              <p className="font-body text-lg text-muted-foreground/80 leading-relaxed mb-8">{product.details}</p>
              <div className="w-20 h-1 bg-primary rounded-full mb-8" />
              <p className="font-body text-muted-foreground italic mb-8">
                Maggiori informazioni saranno disponibili prossimamente.
              </p>

              <a
                href="mailto:info@amareacosmetics.it"
                className="group inline-flex items-center gap-3 bg-foreground text-primary-foreground font-body font-bold text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-500"
              >
                Contattaci per info
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
};

export default ProductPage;
