import { useEffect, useState } from "react";
import { getFactions } from "../api/factions";
import HalftoneHero from "../components/HalftoneHero";
import FactionCard from "../components/FactionCard";

export default function Landing() {
  const [factions, setFactions] = useState([]);

  useEffect(() => {
    getFactions().then(setFactions).catch(console.error);
  }, []);

  return (
    <main>
      <HalftoneHero />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="caption-box">Recruitment dossier</p>
        <h2 className="mb-6 mt-3 font-poster text-3xl text-ink-100">Choose Your Faction</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {factions.map((f) => (
            <FactionCard key={f._id} faction={f} />
          ))}
        </div>
      </section>
    </main>
  );
}
