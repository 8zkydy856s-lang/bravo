import Image from "next/image";

// Ručně psaný nápis BraVo (průhledné PNG 1200×274) místo textového "BRAVO".
// height = pevná výška v px (malé logo v lištách). Bez height použij className
// (např. "bravo-napis") pro responzivní výšku přes CSS.
export default function BravoNapis({ height, className, priority }: { height?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/bravo-napis.png"
      alt="BRAVO"
      width={1200}
      height={202}
      priority={priority}
      className={className}
      style={{ height: height ? `${height}px` : undefined, width: "auto", display: "block" }}
    />
  );
}
