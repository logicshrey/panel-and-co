import { Link } from "react-router-dom";

const THEME = {
  aetherguard: { text: "text-aetherguard-primary", border: "border-aetherguard-primary", grad: "from-aetherguard-primary/20" },
  "ironclad-core": { text: "text-ironclad-primary", border: "border-ironclad-primary", grad: "from-ironclad-primary/20" },
  nightspire: { text: "text-nightspire-secondary", border: "border-nightspire-primary", grad: "from-nightspire-primary/30" },
};

export default function FactionCard({ faction }) {
  const theme = THEME[faction.slug] || THEME.aetherguard;

  return (
    <Link
      to={`/shop?faction=${faction.slug}`}
      className={`panel ink-hover ${theme.text} group relative flex h-64 flex-col justify-end overflow-hidden bg-gradient-to-t ${theme.grad} to-ink-900 p-6 transition-transform hover:-translate-y-1`}
    >
      <span className="caption-box relative z-10 w-fit">Faction</span>
      <h3 className="relative z-10 mt-3 font-poster text-4xl">{faction.name}</h3>
      <p className="relative z-10 mt-1 line-clamp-2 text-sm text-ink-100/75">{faction.description}</p>
    </Link>
  );
}
