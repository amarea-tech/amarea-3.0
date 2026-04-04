import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import productsHero from "@/assets/products-hero-new.png";

interface ProductZone {
  name: string;
  subtitle: string;
  slug: string;
  left: string;
  width: string;
  glowColor: string;
}

const products: ProductZone[] = [
  {
    name: "Sibilla",
    subtitle: "crema viso anti-aging",
    slug: "sibilla",
    left: "5%",
    width: "30%",
    glowColor: "280, 55%, 72%",
  },
  {
    name: "Conero",
    subtitle: "crema viso purificante",
    slug: "conero",
    left: "35%",
    width: "30%",
    glowColor: "155, 55%, 30%",
  },
  {
    name: "Catria",
    subtitle: "crema viso idratante",
    slug: "catria",
    left: "65%",
    width: "30%",
    glowColor: "38, 90%, 60%",
  },
];

const ProductsSection = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const isMobile = useIsMobile();

  return (
    <section id="prodotti" className="py-24 md:py-36 bg-foreground relative overflow-hidden">
      {/* Ambient blurs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-primary-foreground/40 font-body text-xs tracking-[0.3em] uppercase mb-6">
            Amarea Cosmetics
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight">
            Collezione{" "}
            <span className="italic text-violet">Monti Italiani</span>
          </h2>
          <p className="font-body text-primary-foreground/30 mt-5 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Tre creme ispirate ai monti delle Marche, formulate con ingredienti botanici di recupero.
          </p>
        </motion.div>

        {/* Product image with interactive hotspots */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Storytelling ambient glow behind image */}
          {hoveredProduct && !isMobile && (
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                background: `radial-gradient(ellipse at ${
                  hoveredProduct === "sibilla" ? "25%" : hoveredProduct === "conero" ? "50%" : "75%"
                } 60%, hsla(${
                  products.find((p) => p.slug === hoveredProduct)?.glowColor
                }, 0.08) 0%, transparent 70%)`,
              }}
            />
          )}

          <div className="relative rounded-3xl overflow-hidden">
            {/* Main image with subtle zoom on hover */}
            <motion.img
              src={productsHero}
              alt="Collezione Monti Italiani: Sibilla, Conero, Catria"
              className="w-full h-auto"
              animate={
                hoveredProduct && !isMobile
                  ? { scale: 1.02, filter: "brightness(1.03)" }
                  : { scale: 1, filter: "brightness(1)" }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Interactive hotspots (desktop) */}
            {!isMobile &&
              products.map((product) => {
                const isHovered = hoveredProduct === product.slug;

                return (
                  <Link
                    key={product.slug}
                    to={`/prodotti/${product.slug}`}
                    className="absolute top-0 bottom-0 cursor-pointer"
                    style={{
                      left: product.left,
                      width: product.width,
                    }}
                    onMouseEnter={() => setHoveredProduct(product.slug)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    {/* Soft focus glow */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={
                        isHovered
                          ? { opacity: 1 }
                          : { opacity: 0 }
                      }
                      transition={{ duration: 0.6 }}
                      style={{
                        background: `radial-gradient(ellipse at 50% 70%, hsla(${product.glowColor}, 0.12) 0%, transparent 60%)`,
                      }}
                    />

                    {/* Product label */}
                    <motion.div
                      className="absolute bottom-[12%] left-0 right-0 flex justify-center pointer-events-none"
                      animate={
                        isHovered
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 8 }
                      }
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <div className="text-center">
                        <p className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide drop-shadow-sm">
                          {product.name}
                        </p>
                        <p className="font-body text-xs md:text-sm text-foreground/70 mt-1 tracking-wider uppercase drop-shadow-sm">
                          {product.subtitle}
                        </p>
                        <motion.div
                          className="w-8 h-[1px] mx-auto mt-3"
                          style={{ backgroundColor: `hsla(${product.glowColor}, 0.5)` }}
                          animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
          </div>

          {/* Mobile: always-visible product labels below image */}
          {isMobile && (
            <div className="flex justify-between gap-2 mt-6 px-2">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  to={`/prodotti/${product.slug}`}
                  className="flex-1 text-center group"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: `hsl(${product.glowColor})` }}
                  />
                  <p className="font-display text-sm font-semibold text-primary-foreground/80">
                    {product.name}
                  </p>
                  <p className="font-body text-[10px] text-primary-foreground/40 uppercase tracking-wider">
                    {product.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* Desktop: subtle indicators */}
          {!isMobile && (
            <div className="flex justify-center gap-12 mt-10">
              {products.map((product) => (
                <motion.div
                  key={product.slug}
                  className="text-center cursor-pointer"
                  onMouseEnter={() => setHoveredProduct(product.slug)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  animate={{
                    opacity: hoveredProduct === product.slug ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    to={`/prodotti/${product.slug}`}
                    className="block"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-2 transition-all duration-500"
                      style={{
                        backgroundColor: `hsl(${product.glowColor})`,
                        boxShadow:
                          hoveredProduct === product.slug
                            ? `0 0 16px hsla(${product.glowColor}, 0.5)`
                            : "none",
                      }}
                    />
                    <p className="font-display text-sm font-medium" style={{ color: `hsl(${product.glowColor})` }}>
                      {product.name}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
