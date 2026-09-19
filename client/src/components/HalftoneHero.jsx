import { useEffect, useState } from "react";

const TAGLINES = [
  "Suit up. Ship out.",
  "Every faction has a story. Pick yours.",
  "Ironclad Legion — coming soon to your closet.",
];

export default function HalftoneHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % TAGLINES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="halftone-hero flex min-h-[60vh] items-center justify-center bg-ink-950 px-4 text-center">
      <div className="panel panel-diagonal bg-ink-900/90 px-8 py-12 md:px-16 md:py-16">
        <p className="caption-box bg-brand-accent text-ink-950 border-ink-950">Ironclad Legion</p>
        <h1 className="cinematic-title font-poster mt-4 text-6xl text-ink-100 md:text-8xl">
          Panel &amp; Co.
        </h1>
        <p className="mt-4 h-6 text-lg text-ink-100/70 transition-opacity duration-500">
        {TAGLINES[i]}
        </p>
      </div>
    </section>
  );
}
