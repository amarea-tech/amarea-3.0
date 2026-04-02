import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import productsHero from "@/assets/products-hero.jpg";

interface ProductZone {
  name: string;
  subtitle: string;
  slug: string;
  // Percentage-based positions for the hotspot over each cream
  left: string;
  top: string;
  width: string;
  height: string;
  // Lid area (top portion of the hotspot)
  lidTop: string;
  lidHeight: string;
  color: string;
}

const products: ProductZone[] = [
  {
    name: "Conero",
    subtitle: "crema viso idratante",
    slug: "conero",
    left: "7%",
    top: "8%",
    width: "30%",
    height: "88%",
    lidTop: "0%",
    lidHeight: "35%",
    color: "hsl(155, 55%, 30%)",
  },
  {
    name: "Sibilla",
    subtitle: "crema viso anti-age",
    slug: "sibilla",
    left: "33%",
    top: "5%",
    width: "34%",
    height: "92%",
    lidTop: "0%",
    lidHeight: "33%",
    color: "hsl(280, 55%, 72%)",
  },
  {
    name: "Catria",
    subtitle: "crema viso nutriente",
    slug: "catria",
    left: "62%",
    top: "8%",
    width: "33%",
    height: "88%",
    lidTop: "0%",
    lidHeight: "35%",
    color: "hsl(38, 90%, 60%)",
  },
];

const ProductsSection = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section id="prodotti" className="py-24 md:py-32 bg-foreground relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-violet/15 text-violet font-body text-sm font-semibold px-5 py-2 rounded-full mb-6">
            I nostri bestseller 🌿
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground">
            Prodotti che <span className="text-violet">amerai</span>
          </h2>
          <p className="font-body text-primary-foreground/50 mt-4 text-lg">
            Passa sopra una crema per scoprirla 👆
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main product image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={productsHero}
              alt="Le nostre creme: Conero, Sibilla, Catria"
              className="w-full h-auto"
            />

            {/* Interactive hotspots */}
            {products.map((product) => {
              const isHovered = hoveredProduct === product.slug;

              return (
                <Link
                  key={product.slug}
                  to={`/prodotti/${product.slug}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: product.left,
                    top: product.top,
                    width: product.width,
                    height: product.height,
                  }}
                  onMouseEnter={() => setHoveredProduct(product.slug)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {/* Lid unscrew animation overlay */}
                  <motion.div
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{
                      top: product.lidTop,
                      height: product.lidHeight,
                    }}
                    animate={isHovered ? {
                      y: -30,
                      rotateZ: -25,
                      opacity: 0.6,
                    } : {
                      y: 0,
                      rotateZ: 0,
                      opacity: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(ellipse at center, ${product.color}40 0%, transparent 70%)`,
                      }}
                    />
                  </motion.div>

                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={isHovered ? {
                      opacity: 1,
                      scale: 1.02,
                    } : {
                      opacity: 0,
                      scale: 1,
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: `radial-gradient(ellipse at center bottom, ${product.color}30 0%, transparent 60%)`,
                      boxShadow: isHovered ? `0 0 60px ${product.color}40` : "none",
                    }}
                  />

                  {/* Product name label */}
                  <motion.div
                    className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
                    animate={isHovered ? {
                      opacity: 1,
                      y: 0,
                    } : {
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-foreground/90 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-full text-center whitespace-nowrap">
                      <p className="font-display text-lg font-bold">{product.name}</p>
                      <p className="font-body text-xs text-primary-foreground/70">{product.subtitle}</p>
                    </div>
                  </motion.div>

                  {/* Floating "open" arrow indicator */}
                  <motion.div
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
                    animate={isHovered ? {
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                    } : {
                      opacity: 0,
                      scale: 0.5,
                      rotate: -45,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{ backgroundColor: `${product.color}80` }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Product indicators below */}
          <div className="flex justify-center gap-8 mt-8">
            {products.map((product) => (
              <motion.div
                key={product.slug}
                className="text-center cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.slug)}
                onMouseLeave={() => setHoveredProduct(null)}
                animate={{
                  scale: hoveredProduct === product.slug ? 1.1 : 1,
                }}
              >
                <Link
                  to={`/prodotti/${product.slug}`}
                  className="block"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2 transition-all duration-300"
                    style={{
                      backgroundColor: product.color,
                      boxShadow: hoveredProduct === product.slug ? `0 0 20px ${product.color}` : "none",
                    }}
                  />
                  <p className="font-display text-sm font-bold text-primary-foreground/80">{product.name}</p>
                  <p className="font-body text-xs text-primary-foreground/40">{product.subtitle}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
