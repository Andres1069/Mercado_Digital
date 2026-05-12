import { useEffect, useState, useRef } from "react";

export default function HeroCarousel({ images = [], interval = 4000 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  const goPrev = () => {
    clearInterval(timerRef.current);
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = () => {
    clearInterval(timerRef.current);
    setIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden relative">
      <div className="w-full h-56 sm:h-72 lg:h-96 relative">
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`hero-${i}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/50 text-white p-2 rounded-full"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/50 text-white p-2 rounded-full"
      >
        ›
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
